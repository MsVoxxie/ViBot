const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'fox',
	aliases: [],
	description: 'Get a random fox picture!',
	example: '',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {

		let cat;
		await fetch('https://randomfox.ca/floof/').then(r => r.json()).then(j => cat = j);

		const embed = new MessageEmbed()
			.setImage(`${cat.file}`)
			.setColor(settings.guildcolor)
			.setFooter(`A cat for ${message.author.username}!`);

		message.channel.send({ embed: embed });

	},
};