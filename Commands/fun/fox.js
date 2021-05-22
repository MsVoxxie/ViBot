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

		let fox;
		await fetch('https://randomfox.ca/floof/').then(r => r.json()).then(j => fox = j);

		const embed = new MessageEmbed()
			.setImage(`${fox.image}`)
			.setTitle('Random Fox!')
			.setURL(fox.image)
			.setColor(settings.guildcolor)
			.setFooter(`A fox for ${message.author.username}!`);

		message.channel.send({ embed: embed });

	},
};