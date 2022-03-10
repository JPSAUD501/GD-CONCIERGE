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
console.log("Starting...");
require('dotenv').config();
const discord_js_1 = __importDefault(require("discord.js"));
const data_1 = require("./functions/data");
const message_1 = require("./functions/message");
const commands_1 = require("./functions/commands");
const guildId = "720275637415182416";
const datafile = "./members.json";
const client = new discord_js_1.default.Client({
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
client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Bot is ready!");
    yield (0, data_1.updateData)(client, guildId, datafile);
    yield (0, message_1.startMessage)(client, guildId, datafile);
    const interval1 = setInterval(function () {
        return __awaiter(this, void 0, void 0, function* () { (0, message_1.startMessage)(client, guildId, datafile); });
    }, 1000);
}));
client.on('guildMemberAdd', (member) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, data_1.newMemberUpdateData)(client, member, guildId, datafile);
}));
client.on('guildMemberRemove', (member) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, data_1.oldMemberUpdateData)(client, guildId, datafile);
}));
client.on(`voiceStateUpdate`, (oldState, newState) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, message_1.memberChennelMove)(oldState, newState, datafile);
}));
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, commands_1.commands)(client, guildId, datafile, message);
}));
client.login(process.env['token']);
