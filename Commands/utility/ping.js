const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'ping',
	aliases: [],
	description: 'Pong!',
	example: 'ping',
	category: 'utility',
	args: false,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		message.reply(`Pong!\n🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ws.ping)}ms`);
	},
};
