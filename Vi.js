const { Client, Intents, Collection } = require('discord.js');
const { Token } = require('./Storage/Config/Config.json');
const { Player } = require('discord-player');
const cron = require('node-cron');
const fs = require('fs');

//Setup Client
const bot = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	],
	partials: ['MESSAGE', 'REACTION'],
	allowedMentions: {
		repliedUser: false,
		parse: ['roles', 'users', 'everyone'],
	},
});

//Bot Colors
bot.colors = {
	success: '#42f560',
	warning: '#f5e142',
	error: '#f54242',
};

//Undesired members
bot.undesirables = new Map();

//Setup MusicPlayer
const Music = new Player(bot, {
	leaveOnEnd: true,
	leaveOnEndCooldown: 90 * 1000,
	leaveOnStopCooldown: 90 * 1000,
	leaveOnEmptyCooldown: 30 * 1000,
	autoSelfDeaf: true,
	fetchBeforeQueued: true,
	enableLive: true,
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 25,
	},
});

// Music Setup
bot.Music = Music;

// Command Info
bot.commands = new Collection();
bot.interactionCommands = new Collection();
bot.aliases = new Collection();
bot.cooldowns = new Collection();
bot.slash_cooldowns = new Collection();

// Event Info
bot.events = new Collection();

// Load Database
bot.mongoose = require('./Storage/Database/mongoose');
bot.guildDefaults = require('./Storage/Database/models/guildDefaults');
bot.birthdayDefaults = require('./Storage/Database/models/birthdayDefaults');
bot.twitchwatchDefaults = require('./Storage/Database/models/twitchwatchDefaults');

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696', '145325597910892544'];

// Init Loaders
require('./Storage/Core/Context Loader.js')(bot);
require('./Storage/Core/Slash Loader.js')(bot);
require('./Storage/Core/Function Loader')(bot);
require('./Storage/Core/Command Loader')(bot);
require('./Storage/Core/Event Loader')(bot);

//Music
bot.Music.on('error', (queue, error) => {
	console.log(error);
});

// Init Bot / Database
bot.Debug = false;
bot.login(Token);

//Every 8 Hours
cron.schedule('0 8 * * *', () => {
	bot.checkBirthdays();
});

//Minute Interval
setInterval(async () => {
	//YoutubeLive
	await bot.youtubeLiveCheck();

	//Twitch Check
	await bot.twitchLiveCheck();

	//Bot Data
	await bot.updateBotData(bot);

	//Reminder Check
	await bot.checkReminders();

	//Voice Chat XP
	const guilds = bot.guilds.cache;
	for await (const g of guilds) {
		const guild = g[1];
		const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
		const xpadd = clamp(Math.round(Math.random() * 100), 1, 100);
		await bot.awardVoiceXP(xpadd, guild, bot);
	}
}, 1 * 60 * 1000);

//Write Logs to File
const access = fs.createWriteStream(`${__dirname}/Storage/Logs/Logs.txt`, { flags: 'a' });
const error = fs.createWriteStream(`${__dirname}/Storage/Logs/Errors.txt`, { flags: 'a' });

process.stdout.pipe(access);
process.stderr.pipe(error);
