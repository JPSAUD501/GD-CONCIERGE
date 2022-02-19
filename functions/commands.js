const { loadData, saveData } = require("./data.js");

async function commands(client, guildId, datafile, message){
    if(message.author.bot) return;
    if(message.channel.id != "771257420470157322") return;
    const guild = await client.guilds.cache.get(guildId);
    const author = await guild.members.cache.get(message.author.id);
    if(!author._roles.includes("854548174458454036") && !author._roles.includes("774302260024573962")) return message.reply("Esse comando é de uso exclusivo de moderadores!");
    const msg = message.content.split(" ");
    if(msg[0] == "/recepcionar"){
        if(!msg[1]) return message.reply("Por favor especifique um membro");
        if(!msg[2]){
            const member = await guild.members.cache.get(msg[1].replace(/\D+/g, ''));
            if(!member) return message.reply("Membro não encontrado");
            if(member.user.bot) return message.reply("Não é possível recepcionar um bot");
            const data = loadData(datafile);
            if(!data.members[member.id]){
                data.members[member.id] = {
                    "id": member.id,
                    "name": member.user.username,
                    "welcomed": false
                }
                saveData(datafile, data);
            }
            if(data.members[member.id].welcomed){
                return message.reply("Este membro já foi recepcionado!");
            } else {
                return message.reply("Este membro ainda não foi recepcionado!");
            }
        } else {
            if(msg[2] !== "sim" && msg[2] !== "nao") return message.reply("Por favor especifique se deseja recepcionar ou não o membro (sim ou nao)");
            const member = await guild.members.cache.get(msg[1].replace(/\D+/g, ''));
            if(!member) return message.reply("Membro não encontrado");
            if(member.user.bot) return message.reply("Não é possível recepcionar um bot");
            const data = loadData(datafile);
            if(!data.members[member.id]){
                data.members[member.id] = {
                    "id": member.id,
                    "name": member.user.username,
                    "welcomed": false
                }
                saveData(datafile, data);
            }
            if(msg[2] !== "sim"){
                data.members[member.id].welcomed = true;
                saveData(datafile, data);
                message.reply("Este membro não será recepcionado na proxima vez que entrar em um canal de voz!");
            } else {
                data.members[member.id].welcomed = false;
                saveData(datafile, data);
                message.reply("Este membro será recepcionado na proxima vez que entrar em um canal de voz!");
            }
        }
    }
}

module.exports = {
    commands: commands
};