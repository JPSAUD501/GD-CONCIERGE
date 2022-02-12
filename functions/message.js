const { loadData, saveData } = require("./data.js");

const messageChannelId = "941517956242878514";
const defaultBackChannelId = "800214261607301130";
const logChannelId = "919484652736094218";

const video = {
    "link": "https://youtu.be/8okLkFLBD8s",
    "time": "33500"
};

var timer = {
    messageStart: null,
};

var membersWaiting = {};

async function memberChennelMove(oldState, newState, datafile){
    try{
        if(!newState) return;
        if(newState.channelId == null) return;
        if(oldState.channelId == newState.channelId) return;
        const guild = await newState.guild.fetch();
        const member = await guild.members.fetch(newState.id);
        if(member.user.bot) return;
        const channel = guild.channels.cache.get(newState.channelId);
        if(!channel) return;
        if(!channel.name.includes("┊")) return;
        console.log("Channel Ok!");
        let data = loadData(datafile);
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

async function startMessage(client, guildId, datafile){
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
    const messageChannel = guild.channels.cache.get(messageChannelId);
    if(!messageChannel) return;
    const defaultBackChannel = guild.channels.cache.get(defaultBackChannelId);
    if(!defaultBackChannel) return;
    const logChannel = guild.channels.cache.get(logChannelId);
    if(!logChannel) return;
    for(const i in list){
        if(!i) return;
        if(membersWaiting[list[i]].done == true) return;
        if(!membersWaiting[list[i]]) return;
        if(!membersWaiting[list[i]].member) return;
        if(!membersWaiting[list[i]].member.voice) return;
        let qMember = membersWaiting[list[i]].member;
        if(!qMember.voice.channel.name.includes("┊")) return;
        let qChannel = qMember.voice.channel;

        if(timer.messageStart == null){
            //New player
            membersWaiting[list[i]].done = true;
            const message = await logChannel.send(`Iniciando a mensagem de boas-vindas para o usuário: **"${qMember.user.username}" - ${qMember.toString()}** (1)`).catch();
            await client.distube.play(messageChannel, video.link, {
                member: qMember,
                textChannel: logChannel, message
              });
            const queue = await client.distube.getQueue(message);
            await queue.pause();
            await qMember.voice.setChannel(messageChannel).catch(err => {
                console.log(err);
            });
            await queue.seek(0);
            await queue.resume();
            await message.edit(`Iniciando a mensagem de boas-vindas para o usuário: **"${qMember.user.username}" - ${qMember.toString()}** (2)`).catch();
            data.members[qMember.user.id].welcomed = true;
            saveData(datafile, data);
            timer.messageStart = Date.now();
            console.log("New player!");
            setTimeout(async function(){
                setTimeout(async function(){
                    console.log("Player timeout!");
                    timer.messageStart = null;
                    await message.edit(`Iniciando a mensagem de boas-vindas para o usuário: **"${qMember.user.username}" - ${qMember.toString()}** (4)`).catch();
                }, 5000);
                delete membersWaiting[list[i]];
                await message.edit(`Iniciando a mensagem de boas-vindas para o usuário: **"${qMember.user.username}" - ${qMember.toString()}** (3)`).catch();
                if(!qMember.voice.channel) return logChannel.send(`O usuário: **"${qMember.user.username}" - ${qMember.toString()}** saiu dos canais de audio do servidor durante a mensagem!`).catch();
                if(qMember.voice.channel.id !== messageChannelId) return logChannel.send(`O usuário: **"${qMember.user.username}" - ${qMember.toString()}** saiu do canal durante a mensagem!`).catch();
                await qMember.voice.setChannel(qChannel).catch(err => {
                    console.log(err);
                    qMember.voice.setChannel(defaultBackChannel).catch(err => {
                        console.log(err);
                    });
                });
            }, video.time);
        } /*else if(((timer.messageStart - Date.now()) <= waitTime)){
            //Old player
            console.log("Old player!");
            let elapsedTime = (video.time - (timer.messageStart - Date.now()));
            await qMember.voice.setChannel(messageChannel).catch(err => {
                console.log(err);
            });;
            membersWaiting[list[i]].done = true;
            setTimeout(async function(){
                delete membersWaiting[list[i]];
                if(!qMember.voice.channel.id) return;
                if(qMember.voice.channel.id !== messageChannelId) return;
                await qMember.voice.setChannel(qChannel).catch(err => {
                    console.log(err);
                    qMember.voice.setChannel(defaultBackChannel).catch(err => {
                        console.log(err);
                    });
                });
            }, elapsedTime);*/
    }
}

module.exports = {
    memberChennelMove: memberChennelMove,
    startMessage: startMessage
};