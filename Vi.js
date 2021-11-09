const { Client, Intents, Collection } = require('discord.js');
// const { GiveawaysManager } = require('discord-giveaways');
const { Token } = require('./Storage/Config/Config.json');
const { Player } = require('discord-player');

const bot = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES],
	partials: ['MESSAGE', 'REACTION'],
});

const Music = new Player(bot, {
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 25,
	},
});

//Setup Giveaways
// const Raffles = new GiveawaysManager(bot, {
// 	storage: './Storage/Giveaways/Giveaways.json',
// 	updateCountdownEvery: 10 * 1000,
// 	default: {
// 		botsCanWin: false,
// 		embedColor: '#FF0000',
// 		embedColorEnd: '#000000',
// 		reaction: '🗳️',
// 		giveaway: '🗳️ ** RAFFLE STARTED ** 🗳️',
// 		giveawayEnded: '⚠️ **RAFFLE ENDED ** ⚠️',
// 		inviteToParticipate: 'React with 🗳️ to enter!',
// 		embedFooter: 'Good luck to everyone!',
// 	},
// });

// bot.RaffleManager = Raffles;

//Global NSFW Blacklist
bot.GlobalNSFWBlacklist = ['cub', 'loli', 'lolicon', 'shota', 'young', 'child', 'boy', 'girl', 'infant', 'youth', 'baby', 'youngling', 'underage', 'immature', 'ped0', 'ped0philia', 'rape', 'noncon', 'bestiality'];

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

// Load Functions
require('./Storage/Functions/dbFunctions')(bot);
require('./Storage/Functions/utilFunctions')(bot);
require('./Storage/Functions/twitterFunctions')(bot);
require('./Storage/Functions/giveawayDatabase')(bot);
require('./Storage/Functions/birthdayFunctions')(bot);

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696'];

// Init Loaders
require('./Storage/Core/Command Loader')(bot);
require('./Storage/Core/Event Loader')(bot);

//Music
bot.Music.on('error', (queue, error) => {
	console.log(error);
});

// bot.Music.on('trackStart', (queue, track) => queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`));

// Init Bot / Database
bot.mongoose.init();
bot.login(Token);
