require('dotenv').config();
const Discord = require('discord.js');
const { DisTube } = require('distube');
const { updateData, newMemberUpdateData, oldMemberUpdateData } = require("./functions/data.js");
const { memberChennelMove, startMessage } = require("./functions/message.js");
const guildId = "720275637415182416";
const datafile = "./members.json";

const client = new Discord.Client({
    fetchAllMembers: true,
    restTimeOffset: 0,
    shards: "auto",
    restWsBridgetimeout: 100,
    disableEveryone: true,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
          "GUILDS",
          "GUILD_MEMBERS",
          "GUILD_BANS",
          "GUILD_INTEGRATIONS",
          "GUILD_WEBHOOKS",
          "GUILD_INVITES",
          "GUILD_VOICE_STATES",
          "GUILD_PRESENCES",
          "GUILD_MESSAGES",
          "GUILD_MESSAGE_REACTIONS",
          "GUILD_MESSAGE_TYPING",
          "DIRECT_MESSAGES",
          "DIRECT_MESSAGE_REACTIONS",
          "DIRECT_MESSAGE_TYPING",
        ]
  });

  client.distube = new DisTube(client, {
    leaveOnStop: true,
    leaveOnFinish: true,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [],
    youtubeDL: false
  });

  client.on("ready", () => {
    
    console.log("Bot is ready!");

    updateData(client, guildId, datafile);

    startMessage(client, guildId, datafile);
    const interval1 = setInterval(async function(){startMessage(client, guildId, datafile);}, 1000);
  
  });

  client.on('guildMemberAdd', member => {

    newMemberUpdateData(client, member, guildId, datafile);
  
  });

  client.on('guildMemberRemove', member => {

    oldMemberUpdateData(client, guildId, datafile);

  });

  client.on(`voiceStateUpdate`, (oldState, newState) => {

    memberChennelMove(oldState, newState, datafile);

  });

  client.login(process.env['token']);