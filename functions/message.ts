import { loadData, saveData } from "./data";
import fs from "fs";
import { join } from "path";
import { Client, VoiceChannel, TextChannel, GuildMember, VoiceState } from 'discord.js';
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	StreamType,
    getVoiceConnection
} from '@discordjs/voice';

const messageChannelId = "941517956242878514";
const defaultBackChannelId = "800214261607301130";
const logChannelId = "919484652736094218";

var membersWaiting: {
    [key: string]: { 
        member: GuildMember,
        done: boolean,
        time: number
    }
} = {};

var timer: {
    [key: string]: number | null
} = {
    messageStart: null,
};

async function wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export async function memberChennelMove(oldState: VoiceState, newState: VoiceState, datafile: string){
    try{
        if(!newState) return;
        await wait(5000);
        if(newState.channelId == null) return;
        const guild = await newState.guild.fetch();
        const member = await guild.members.fetch(newState.id);
        if(member.user.bot) return;
        if(newState.selfDeaf == true) return console.log("Member is deaf!");
        if(oldState.selfDeaf && !newState.selfDeaf){} else if(oldState.channelId == newState.channelId) return;
        let data = loadData(datafile);
        if(!data.members){
            data.members = {};
            saveData(datafile, data);
        }
        if(!data.members[newState.id]){
            console.log("New member!", member.user.username);
            data.members[newState.id] = {
                "id": newState.id,
                "name": member.user.username,
                "welcomed": false
            }
            saveData(datafile, data);
        }
        const channel = guild.channels.cache.get(newState.channelId);
        if(!channel) return;
        if(!channel.name.includes("┊")) return;
        console.log("Channel Ok!");
        if(!data.members) return console.log("Members file not found!");
        if(!data.members[member.user.id]) return console.log("Member not found!");
        if(data.members[member.user.id].welcomed) return;

        console.log("Welcome to new member!");

        membersWaiting[member.user.id] = {
            "member": member,
            "done": false,
            "time": Date.now()
        };

    }catch(err){
        console.log(err);
    }
}

export async function startMessage(client: Client, guildId: string, datafile: string){	
    //console.log("Checking for new member in call!");
    var list = Object.keys(membersWaiting);
    if(list.length == 0) return;
    for(const i in list){
        if((membersWaiting[list[i]].time - Date.now()) >= 60000) delete membersWaiting[list[i]];
        if(!membersWaiting[list[i]].member.voice) delete membersWaiting[list[i]];
    }
    list = Object.keys(membersWaiting);
    //console.log(membersWaiting);
    if(list.length == 0) return;
    console.log(list);
    var data = loadData(datafile);
    const guild = await client.guilds.cache.get(guildId);
    if(!guild) return;
    const messageChannel = guild.channels.cache.get(messageChannelId);
    if(!messageChannel) return;
    const defaultBackChannel = guild.channels.cache.get(defaultBackChannelId);
    if(!defaultBackChannel) return;
    const logChannel = guild.channels.cache.get(logChannelId);
    if(!logChannel) return;
    for(const i in list){
        if(!i) return;
        if(!membersWaiting[list[i]]) return;
        if(membersWaiting[list[i]].done == true) return;
        if(!membersWaiting[list[i]].member) return;
        if(!membersWaiting[list[i]].member.voice) return;
        let qMember = membersWaiting[list[i]].member;
        if(!qMember.voice.channel) return;
        if(!qMember.voice.channel.name.includes("┊")) return;
        let qChannel = qMember.voice.channel;

        if(timer.messageStart == null){
            //New player
            membersWaiting[list[i]].done = true;
            const message = await (logChannel as TextChannel).send(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (1)`).catch();
            const player = createAudioPlayer();
            const resource = createAudioResource(fs.createReadStream(join(__dirname, "audio.webm")), {
                inputType: StreamType.WebmOpus,
            });
            const connection = joinVoiceChannel({
                channelId: messageChannel.id,
                guildId: messageChannel.guild.id,
                adapterCreator: messageChannel.guild.voiceAdapterCreator,
            });
            timer.messageStart = Date.now();
            
            connection.subscribe(player);
            player.play(resource);
            while(player.state.status !== "playing") if(Date.now() - timer.messageStart > 10000) return async function(){
                delete membersWaiting[list[i]];
                getVoiceConnection(messageChannel.guild.id)?.disconnect();
                await wait(2000);
                timer.messageStart = null;
            }(); else {
                console.log("Loading... " + player.state.status);
                await wait(50);
            }
            await qMember.voice.setChannel(messageChannel as VoiceChannel).catch(() => {
                //console.log(err);
            });
            data.members[qMember.user.id].welcomed = true;
            saveData(datafile, data);
            await message.edit(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (2)`).catch();
            while((player.state.status == "playing") && (Date.now()-timer.messageStart < 50000)){
                console.log("Waiting for message to end!");
                console.log(player.state.status);
                await wait(250);
            }
            console.log("End of audio!");
            await message.edit(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (4)`).catch();
            delete membersWaiting[list[i]];
            const backToChannel = async function(){
                if(!qMember.voice.channel) return (logChannel as TextChannel).send(`O membro: **"${qMember.user.username}" - "${qMember.toString()}"** saiu dos canais de audio do servidor durante a mensagem!`).catch();
                if(qMember.voice.channel.id !== messageChannelId) return (logChannel as TextChannel).send(`O membro: **"${qMember.user.username}" - "${qMember.toString()}"** saiu do canal durante a mensagem!`).catch();
                await qMember.voice.setChannel(qChannel).catch(() => {
                    //console.log(err);
                    qMember.voice.setChannel(defaultBackChannel as VoiceChannel).catch(() => {
                        //console.log(err);
                    });
                });
            }
            backToChannel();
            getVoiceConnection(messageChannel.guild.id)?.disconnect();
            await wait(2000);
            timer.messageStart = null;
        }
    }
}