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
exports.oldMemberUpdateData = exports.newMemberUpdateData = exports.updateData = exports.saveData = exports.loadData = exports.createFile = void 0;
const fs_1 = __importDefault(require("fs"));
function createFile(datafile) {
    fs_1.default.writeFileSync(("./" + datafile), ("{}"));
}
exports.createFile = createFile;
function loadData(datafile) {
    if (!fs_1.default.existsSync("./" + (datafile))) {
        console.log("Creating file!", datafile);
        createFile(datafile);
        let datajson = JSON.parse(fs_1.default.readFileSync("./" + (datafile), 'utf8'));
        saveData(datafile, datajson);
        let datajson2 = JSON.parse(fs_1.default.readFileSync("./" + (datafile), 'utf8'));
        return datajson2;
    }
    else {
        let datajson = JSON.parse(fs_1.default.readFileSync("./" + (datafile), 'utf8'));
        return datajson;
    }
}
exports.loadData = loadData;
function saveData(datafile, data) {
    fs_1.default.writeFileSync("./" + (datafile), JSON.stringify(data, null, 2));
    //console.log("Pre-saved!", datafile)
    var dataverify = loadData(datafile);
    fs_1.default.writeFileSync("./" + (datafile), JSON.stringify(dataverify, null, 2));
    console.log("Saved!", datafile);
}
exports.saveData = saveData;
function updateData(client, guildId, datafile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = loadData(datafile);
        if (!data.members) {
            data.members = {};
            saveData(datafile, data);
        }
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            return;
        guild.members.cache.each(member => {
            if (member.user.bot)
                return;
            if (!data.members[member.user.id]) {
                console.log("New member!", member.user.username);
                data.members[member.user.id] = {
                    "id": member.user.id,
                    "name": member.user.username,
                    "welcomed": false
                };
                saveData(datafile, data);
            }
        });
    });
}
exports.updateData = updateData;
function newMemberUpdateData(client, member, guildId, datafile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = loadData(datafile);
        if (member.user.bot)
            return;
        if (!data.members) {
            data.members = {};
            saveData(datafile, data);
        }
        console.log("New member!", member.user.username);
        data.members[member.user.id] = {
            "id": member.user.id,
            "name": member.user.username,
            "welcomed": false
        };
        saveData(datafile, data);
    });
}
exports.newMemberUpdateData = newMemberUpdateData;
function oldMemberUpdateData(client, guildid, datafile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = loadData(datafile);
        const guild = client.guilds.cache.get(guildid);
        if (!guild)
            return;
        var list = Object.keys(data.members);
        var allmembers = [];
        guild.members.cache.each(member => {
            allmembers.push(member.id);
        });
        for (const i in list) {
            if (!allmembers.includes(list[i])) {
                console.log(data.members[list[i]]);
                delete data.members[list[i]];
                console.log("Deleting old member from data!");
                saveData(datafile, data);
            }
        }
    });
}
exports.oldMemberUpdateData = oldMemberUpdateData;
