const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'fox',
	aliases: [],
	description: 'Get a random fox picture!',
	example: 'fox',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		let fox;
		const loading = await message.lineReply(`${Vimotes['A_LOADING']}Finding a Fox for you...`);
		await fetch('https://randomfox.ca/floof/').then(r => r.json()).then(j => fox = j);

		const embed = new MessageEmbed()
			.setImage(`${fox.image}`)
			.setTitle('Random Fox!')
			.setURL(fox.image)
			.setColor(settings.guildcolor)
			.setFooter(`A fox for ${message.author.username}!`);

		await loading.edit('', { embed: embed });

	},
};