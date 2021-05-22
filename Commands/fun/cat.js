const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'cat',
	aliases: [],
	description: 'Get a random cat picture!',
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
		await fetch('http://aws.random.cat/meow').then(r => r.json()).then(j => cat = j);

		const embed = new MessageEmbed()
			.setImage(`${cat.file}`)
			.setTitle('Random Cat!')
			.setURL(cat.image)
			.setColor(settings.guildcolor)
			.setFooter(`A cat for ${message.author.username}!`);

		message.channel.send({ embed: embed });

	},
};