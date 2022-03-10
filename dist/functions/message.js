"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMessage = exports.memberChennelMove = void 0;
const data_1 = require("./data");
const voice_1 = __importDefault(require("@discordjs/voice"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const messageChannelId = "941517956242878514";
const defaultBackChannelId = "800214261607301130";
const logChannelId = "919484652736094218";
var membersWaiting = {};
var timer = {
    messageStart: null,
};
function wait(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(r, ms));
    });
}
function memberChennelMove(oldState, newState, datafile) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!newState)
                return;
            yield wait(5000);
            if (newState.channelId == null)
                return;
            const guild = yield newState.guild.fetch();
            const member = yield guild.members.fetch(newState.id);
            if (member.user.bot)
                return;
            if (newState.selfDeaf == true)
                return console.log("Member is deaf!");
            if (oldState.selfDeaf && !newState.selfDeaf) { }
            else if (oldState.channelId == newState.channelId)
                return;
            let data = (0, data_1.loadData)(datafile);
            if (!data.members) {
                data.members = {};
                (0, data_1.saveData)(datafile, data);
            }
            if (!data.members[newState.id]) {
                console.log("New member!", member.user.username);
                data.members[newState.id] = {
                    "id": newState.id,
                    "name": member.user.username,
                    "welcomed": false
                };
                (0, data_1.saveData)(datafile, data);
            }
            const channel = guild.channels.cache.get(newState.channelId);
            if (!channel)
                return;
            if (!channel.name.includes("┊"))
                return;
            console.log("Channel Ok!");
            if (!data.members)
                return console.log("Members file not found!");
            if (!data.members[member.user.id])
                return console.log("Member not found!");
            if (data.members[member.user.id].welcomed)
                return;
            console.log("Welcome to new member!");
            membersWaiting[member.user.id] = {
                "member": member,
                "done": false,
                "time": Date.now()
            };
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.memberChennelMove = memberChennelMove;
function startMessage(client, guildId, datafile) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        //console.log("Checking for new member in call!");
        var list = Object.keys(membersWaiting);
        if (list.length == 0)
            return;
        for (const i in list) {
            if ((membersWaiting[list[i]].time - Date.now()) >= 60000)
                delete membersWaiting[list[i]];
            if (!membersWaiting[list[i]].member.voice)
                delete membersWaiting[list[i]];
        }
        list = Object.keys(membersWaiting);
        //console.log(membersWaiting);
        if (list.length == 0)
            return;
        console.log(list);
        var data = (0, data_1.loadData)(datafile);
        const guild = yield client.guilds.cache.get(guildId);
        if (!guild)
            return;
        const messageChannel = guild.channels.cache.get(messageChannelId);
        if (!messageChannel)
            return;
        const defaultBackChannel = guild.channels.cache.get(defaultBackChannelId);
        if (!defaultBackChannel)
            return;
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel)
            return;
        for (const i in list) {
            if (!i)
                return;
            if (!membersWaiting[list[i]])
                return;
            if (membersWaiting[list[i]].done == true)
                return;
            if (!membersWaiting[list[i]].member)
                return;
            if (!membersWaiting[list[i]].member.voice)
                return;
            let qMember = membersWaiting[list[i]].member;
            if (!qMember.voice.channel)
                return;
            if (!qMember.voice.channel.name.includes("┊"))
                return;
            let qChannel = qMember.voice.channel;
            if (timer.messageStart == null) {
                //New player
                membersWaiting[list[i]].done = true;
                const message = yield logChannel.send(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (1)`).catch();
                const player = yield voice_1.default.createAudioPlayer();
                const resource = yield voice_1.default.createAudioResource(fs_1.default.createReadStream((0, path_1.join)(__dirname, "audio.webm")), {
                    inputType: voice_1.default.StreamType.WebmOpus,
                });
                const connection = yield voice_1.default.joinVoiceChannel({
                    channelId: messageChannel.id,
                    guildId: messageChannel.guild.id,
                    adapterCreator: messageChannel.guild.voiceAdapterCreator,
                });
                timer.messageStart = Date.now();
                yield connection.subscribe(player);
                yield player.play(resource);
                while (player.state.status !== "playing")
                    if (Date.now() - timer.messageStart > 10000)
                        return function () {
                            var _a;
                            return __awaiter(this, void 0, void 0, function* () {
                                delete membersWaiting[list[i]];
                                yield ((_a = voice_1.default.getVoiceConnection(messageChannel.guild.id)) === null || _a === void 0 ? void 0 : _a.disconnect());
                                yield wait(2000);
                                timer.messageStart = null;
                            });
                        }();
                    else {
                        console.log("Loading... " + player.state.status);
                        yield wait(50);
                    }
                yield qMember.voice.setChannel(messageChannel).catch(err => {
                    //console.log(err);
                });
                data.members[qMember.user.id].welcomed = true;
                (0, data_1.saveData)(datafile, data);
                yield message.edit(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (2)`).catch();
                while ((player.state.status == "playing") && (Date.now() - timer.messageStart < 50000)) {
                    console.log("Waiting for message to end!");
                    console.log(player.state.status);
                    yield wait(250);
                }
                console.log("End of audio!");
                yield message.edit(`Iniciando a mensagem de boas-vindas para o membro: **"${qMember.user.username}" - "${qMember.toString()}"** (4)`).catch();
                delete membersWaiting[list[i]];
                const backToChannel = function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!qMember.voice.channel)
                            return logChannel.send(`O membro: **"${qMember.user.username}" - "${qMember.toString()}"** saiu dos canais de audio do servidor durante a mensagem!`).catch();
                        if (qMember.voice.channel.id !== messageChannelId)
                            return logChannel.send(`O membro: **"${qMember.user.username}" - "${qMember.toString()}"** saiu do canal durante a mensagem!`).catch();
                        yield qMember.voice.setChannel(qChannel).catch(err => {
                            //console.log(err);
                            qMember.voice.setChannel(defaultBackChannel).catch(err => {
                                //console.log(err);
                            });
                        });
                    });
                };
                backToChannel();
                yield ((_a = voice_1.default.getVoiceConnection(messageChannel.guild.id)) === null || _a === void 0 ? void 0 : _a.disconnect());
                yield wait(2000);
                timer.messageStart = null;
            }
        }
    });
}
exports.startMessage = startMessage;
