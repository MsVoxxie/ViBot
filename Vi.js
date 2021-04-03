const Discord = require('discord.js');
const { Token } = require('./Storage/Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');

// Setup Core and Bot.
const lib = require('./Storage/Core/EventLoader');
const bot = new Discord.Client();
lib.setup(bot);
// Export it.
module.exports = { bot: bot };

// Command Info
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.cooldowns = new Discord.Collection();

bot.mongoose = require('./Storage/Database/mongoose');
bot.defaults = require('./Storage/Database/models/dbDefaults');
require('./Storage/Functions/functions')(bot);

// Declare myself as Owner of bot.
bot.Owners = ['101789503634554880', '101790332437405696'];

// Init Command Loader
['Command Loader'].forEach(handler => {
	require(`./Events/${handler}`)(bot);
});

bot.once('ready', () => {
	bot.guilds.cache.forEach((f) => {
		table.addRow(`${f.name}`, '✔ -> Connected');
	});
	console.log(table.toString());
	bot.StartedAt = Date.now();
});

bot.mongoose.init();
bot.login(Token);