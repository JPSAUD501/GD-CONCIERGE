import fs from 'fs'
import { Client, GuildMember } from 'discord.js'

export function createFile (dataFile: string) {
  fs.writeFileSync(('./' + dataFile), ('{}'))
}

export function loadData (dataFile: string) {
  if (!fs.existsSync('./' + (dataFile))) {
    console.log('Creating file!', dataFile)
    createFile(dataFile)
    const dataJson = JSON.parse(fs.readFileSync('./' + (dataFile), 'utf8'))
    saveData(dataFile, dataJson)
    const dataJson2 = JSON.parse(fs.readFileSync('./' + (dataFile), 'utf8'))
    return dataJson2
  } else {
    const dataJson = JSON.parse(fs.readFileSync('./' + (dataFile), 'utf8'))
    return dataJson
  }
}

export function saveData (dataFile: string, data: object) {
  fs.writeFileSync('./' + (dataFile), JSON.stringify(data, null, 2))
  // console.log("Pre-saved!", datafile)
  const dataVerify = loadData(dataFile)
  fs.writeFileSync('./' + (dataFile), JSON.stringify(dataVerify, null, 2))
  console.log('Saved!', dataFile)
}

export async function updateData (client: Client, guildId: string, datafile: string) {
  const data = loadData(datafile)
  if (!data.members) {
    data.members = {}
    saveData(datafile, data)
  }
  const guild = client.guilds.cache.get(guildId)
  if (!guild) return
  guild.members.cache.each(member => {
    if (member.user.bot) return
    if (!data.members[member.user.id]) {
      console.log('New member!', member.user.username)
      data.members[member.user.id] = {
        id: member.user.id,
        name: member.user.username,
        welcomed: false
      }
      saveData(datafile, data)
    }
  })
}

export async function newMemberUpdateData (client: Client, member: GuildMember, guildId: string, dataFile: string) {
  const data = loadData(dataFile)
  if (member.user.bot) return
  if (!data.members) {
    data.members = {}
    saveData(dataFile, data)
  }
  console.log('New member!', member.user.username)
  data.members[member.user.id] = {
    id: member.user.id,
    name: member.user.username,
    welcomed: false
  }
  saveData(dataFile, data)
}

export async function oldMemberUpdateData (client: Client, guildId: string, dataFile: string) {
  const data = loadData(dataFile)
  const guild = client.guilds.cache.get(guildId)
  if (!guild) return
  const list = Object.keys(data.members)
  const allMembers : string[] = []
  guild.members.cache.each(member => {
    allMembers.push(member.id)
  })
  for (const i in list) {
    if (!allMembers.includes(list[i])) {
      console.log(data.members[list[i]])
      delete data.members[list[i]]
      console.log('Deleting old member from data!')
      saveData(dataFile, data)
    }
  }
}
