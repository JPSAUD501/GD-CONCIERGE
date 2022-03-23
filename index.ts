import Discord from 'discord.js'
import { updateData, newMemberUpdateData, oldMemberUpdateData } from './functions/data'
import { memberChannelMove, startMessage } from './functions/message'
import { commands } from './functions/commands'

console.log('Starting...')

require('dotenv').config()

const guildId = '720275637415182416'
const dataFile = './members.json'

const client = new Discord.Client({
  restTimeOffset: 0,
  shards: 'auto',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING'
  ]
})

client.on('ready', async () => {
  console.log('Bot is ready!')

  await updateData(client, guildId, dataFile)

  await startMessage(client, guildId, dataFile)
  setInterval(async function () { startMessage(client, guildId, dataFile) }, 1000)
})

client.on('guildMemberAdd', async member => {
  await newMemberUpdateData(client, member, guildId, dataFile)
})

client.on('guildMemberRemove', async member => {
  await oldMemberUpdateData(client, guildId, dataFile)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  await memberChannelMove(oldState, newState, dataFile)
})

client.on('messageCreate', async message => {
  await commands(client, guildId, dataFile, message)
})

client.login(process.env.token)
