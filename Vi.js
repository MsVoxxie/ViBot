const { Client, Intents, Collection } = require('discord.js');
// const { GiveawaysManager } = require('discord-giveaways');
const { Token } = require('./Storage/Config/Config.json');
const { Player } = require('discord-player');
const cron = require('node-cron');

const bot = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES],
	partials: ['MESSAGE', 'REACTION'],
	allowedMentions: {
		repliedUser: true,
		parse: ['roles', 'users', 'everyone'],
	},
});

const Music = new Player(bot, {
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 25,
	},
});

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
bot.birthdayDefaults = require('./Storage/Database/models/birthdayDefaults');
bot.twitchwatchDefaults = require('./Storage/Database/models/twitchwatchDefaults');

// Load Functions
require('./Storage/Functions/dbFunctions')(bot);
require('./Storage/Functions/utilFunctions')(bot);
require('./Storage/Functions/twitterFunctions')(bot);
require('./Storage/Functions/giveawayDatabase')(bot);
require('./Storage/Functions/birthdayFunctions')(bot);
require('./Storage/Functions/twitchFunctions')(bot);

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696'];

// Init Loaders
require('./Storage/Core/Command Loader')(bot);
require('./Storage/Core/Event Loader')(bot);

//Music
bot.Music.on('error', (queue, error) => {
	console.log(error);
});

// Init Bot / Database
bot.mongoose.init();
bot.login(Token);

//Birthday Check
cron.schedule('0 8 * * *', () => {
	bot.checkBirthdays();
});

//Twitch Check
cron.schedule('* * * * *', () => {
	bot.twitchWatch();
});
