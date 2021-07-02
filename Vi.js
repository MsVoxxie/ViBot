const Discord = require('discord.js');
require('discord-reply');
const { Token } = require('./Storage/Config/Config.json');
const { Player } = require('discord-player');
const bot = new Discord.Client({ disableMentions: 'everyone', partials: ['REACTION', 'MESSAGE'] });
const Music = new Player(bot, {
	leaveOnEnd: true,
	leaveOnEmpty: true,
	leaveOnStop: true,
	enableLive: true,
	leaveOnEndCooldown: 15 * 1000,
	leaveOnEmptyCooldown: 60 * 1000,
});

// Music Setup
bot.Music = Music;

// Command Info
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.cooldowns = new Discord.Collection();

// Event Info
bot.events = new Discord.Collection();

// Load Database
bot.mongoose = require('./Storage/Database/mongoose');
bot.guildDefaults = require('./Storage/Database/models/guildDefaults');
bot.guildModerationDefaults = require('./Storage/Database/models/guildModerationDefaults');
bot.reactionDefaults = require('./Storage/Database/models/reactionDefaults');

// Load Functions
require('./Storage/Functions/dbFunctions')(bot);
require('./Storage/Functions/utilFunctions')(bot);

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696'];

// Init Loaders
require('./Storage/Core/Command Loader')(bot);
require('./Storage/Core/Event Loader')(bot);

// Init Bot / Database
bot.mongoose.init();
bot.login(Token);
