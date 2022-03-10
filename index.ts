console.log("Starting...");

require('dotenv').config();
import Discord from 'discord.js';
import { updateData, newMemberUpdateData, oldMemberUpdateData } from "./functions/data";
import { memberChennelMove, startMessage } from "./functions/message";
import { commands } from "./functions/commands";

const guildId = "720275637415182416";
const datafile = "./members.json";

const client = new Discord.Client({
    restTimeOffset: 0,
    shards: "auto",
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

  client.on("ready", async () => {
    
    console.log("Bot is ready!");

    await updateData(client, guildId, datafile);

    await startMessage(client, guildId, datafile);
    const interval1 = setInterval(async function(){startMessage(client, guildId, datafile);}, 1000);
  
  });

  client.on('guildMemberAdd', async member => {

    await newMemberUpdateData(client, member, guildId, datafile);
  
  });

  client.on('guildMemberRemove', async member => {

    await oldMemberUpdateData(client, guildId, datafile);

  });

  client.on(`voiceStateUpdate`, async (oldState, newState) => {

    await memberChennelMove(oldState, newState, datafile);

  });

  client.on('messageCreate', async message => {

    await commands(client, guildId, datafile, message);

  });

  client.login(process.env['token']);