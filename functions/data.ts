import fs from 'fs';
import { Client, GuildMember, Guild } from 'discord.js';
import { object, string } from 'zod';

export function createFile(datafile: string){
    fs.writeFileSync(("./"+datafile), ("{}"));
}
  
export function loadData(datafile: string){
    if (!fs.existsSync("./"+(datafile))){
      console.log("Creating file!", datafile);
      createFile(datafile)
      let datajson = JSON.parse(fs.readFileSync("./"+(datafile), 'utf8'));
      saveData(datafile, datajson);
      let datajson2 = JSON.parse(fs.readFileSync("./"+(datafile), 'utf8'));
      return datajson2;
    } else{
      let datajson = JSON.parse(fs.readFileSync("./"+(datafile), 'utf8'));
      return datajson;
    }
}
  
export function saveData(datafile: string, data: object){
    fs.writeFileSync("./"+(datafile), JSON.stringify(data, null, 2));
    //console.log("Pre-saved!", datafile)
    var dataverify = loadData(datafile);
    fs.writeFileSync("./"+(datafile), JSON.stringify(dataverify, null, 2));
    console.log("Saved!", datafile)
  }

export async function updateData(client: Client, guildId: string, datafile: string){
    let data = loadData(datafile);
    if(!data.members){
        data.members = {};
        saveData(datafile, data);
    }
    const guild = client.guilds.cache.get(guildId);
    if(!guild) return;
    guild.members.cache.each(member => {
        if(member.user.bot) return;
        if(!data.members[member.user.id]){
            console.log("New member!", member.user.username);
            data.members[member.user.id] = {
                "id": member.user.id,
                "name": member.user.username,
                "welcomed": false
            }
            saveData(datafile, data);
        }
    });
}

export async function newMemberUpdateData(client: Client, member: GuildMember, guildId: string, datafile: string){
    let data = loadData(datafile);
    if(member.user.bot) return;
    if(!data.members){
        data.members = {};
        saveData(datafile, data);
    }
    console.log("New member!", member.user.username);
    data.members[member.user.id] = {
        "id": member.user.id,
        "name": member.user.username,
        "welcomed": false
    }
    saveData(datafile, data);
}

export async function oldMemberUpdateData(client: Client, guildid: string, datafile: string){
  let data = loadData(datafile);
  const guild = client.guilds.cache.get(guildid);
  if(!guild) return;
  var list = Object.keys(data.members);
  var allmembers : string[] = [];
  guild.members.cache.each(member => {
    allmembers.push(member.id);
  })
  for (const i in list){
    if (!allmembers.includes(list[i])) {
      console.log(data.members[list[i]]);
      delete data.members[list[i]];
      console.log("Deleting old member from data!")
      saveData(datafile, data)
    }
  }
}