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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const data_1 = require("./data");
function commands(client, guildId, datafile, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
        if (message.channel.id != "771257420470157322")
            return;
        const guild = yield client.guilds.cache.get(guildId);
        if (!guild)
            return;
        const author = yield guild.members.cache.get(message.author.id);
        if (!author)
            return;
        if (!author.roles.cache.has("854548174458454036") && !author.roles.cache.has("774302260024573962"))
            return message.reply("Esse comando é de uso exclusivo de moderadores!");
        const msg = message.content.split(" ");
        if (msg[0] == "/recepcionar") {
            if (!msg[1])
                return message.reply("Por favor especifique um membro");
            if (!msg[2]) {
                const member = yield guild.members.cache.get(msg[1].replace(/\D+/g, ''));
                if (!member)
                    return message.reply("Membro não encontrado");
                if (member.user.bot)
                    return message.reply("Não é possível recepcionar um bot");
                const data = (0, data_1.loadData)(datafile);
                if (!data.members[member.id]) {
                    data.members[member.id] = {
                        "id": member.id,
                        "name": member.user.username,
                        "welcomed": false
                    };
                    (0, data_1.saveData)(datafile, data);
                }
                if (data.members[member.id].welcomed) {
                    return message.reply("Este membro já foi recepcionado!");
                }
                else {
                    return message.reply("Este membro ainda não foi recepcionado!");
                }
            }
            else {
                if (msg[2] !== "sim" && msg[2] !== "nao")
                    return message.reply("Por favor especifique se deseja recepcionar ou não o membro (sim ou nao)");
                const member = yield guild.members.cache.get(msg[1].replace(/\D+/g, ''));
                if (!member)
                    return message.reply("Membro não encontrado");
                if (member.user.bot)
                    return message.reply("Não é possível recepcionar um bot");
                const data = (0, data_1.loadData)(datafile);
                if (!data.members[member.id]) {
                    data.members[member.id] = {
                        "id": member.id,
                        "name": member.user.username,
                        "welcomed": false
                    };
                    (0, data_1.saveData)(datafile, data);
                }
                if (msg[2] !== "sim") {
                    data.members[member.id].welcomed = true;
                    (0, data_1.saveData)(datafile, data);
                    message.reply("Este membro não será recepcionado na proxima vez que entrar em um canal de voz!");
                }
                else {
                    data.members[member.id].welcomed = false;
                    (0, data_1.saveData)(datafile, data);
                    message.reply("Este membro será recepcionado na proxima vez que entrar em um canal de voz!");
                }
            }
        }
    });
}
exports.commands = commands;
module.exports = {
    commands: commands
};
