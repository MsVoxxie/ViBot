const { Client, Intents, Collection } = require('discord.js');
const { Token } = require('./Storage/Config/Config.json');
const { Player } = require('discord-player');
const bot = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
	],
	partials: ['MESSAGE', 'REACTION'],
});
const Music = new Player(bot, {
	leaveOnEnd: true,
	leaveOnEmpty: true,
	leaveOnStop: true,
	enableLive: true,
	leaveOnEndCooldown: 15 * 1000,
	leaveOnEmptyCooldown: 60 * 1000,
});

//Global NSFW Blacklist
bot.GlobalNSFWBlacklist = [
	'cub',
	'loli',
	'lolicon',
	'shota',
	'young',
	'child',
	'boy',
	'girl',
	'infant',
	'youth',
	'baby',
	'youngling',
	'underage',
	'immature',
	'ped0',
	'ped0philia',
	'rape',
	'noncon',
	'bestiality',
];

// Music Setup
bot.Music = Music;

// Command Info
bot.commands = new Collection();
bot.aliases = new Collection();
bot.cooldowns = new Collection();

// Event Info
bot.events = new Collection();

// Load Database
bot.mongoose = require('./Storage/Database/mongoose');
bot.guildDefaults = require('./Storage/Database/models/guildDefaults');
bot.reactionDefaults = require('./Storage/Database/models/reactionDefaults');

// Load Functions
require('./Storage/Functions/dbFunctions')(bot);
require('./Storage/Functions/utilFunctions')(bot);
require('./Storage/Functions/twitterFunctions')(bot);

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696'];

// Init Loaders
require('./Storage/Core/Command Loader')(bot);
require('./Storage/Core/Event Loader')(bot);

// Init Bot / Database
bot.mongoose.init();
bot.login(Token);
