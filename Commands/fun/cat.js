const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'cat',
	aliases: [],
	description: 'Get a random cat picture!',
	example: 'cat',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		let cat;
		const loading = await message.lineReply(`${Vimotes['A_LOADING']}Finding a Kitty for you...`);
		await fetch('http://aws.random.cat/meow').then(r => r.json()).then(j => cat = j);

		const embed = new MessageEmbed()
			.setImage(`${cat.file}`)
			.setTitle('Random Cat!')
			.setURL(cat.file)
			.setColor(settings.guildcolor)
			.setFooter(`A cat for ${message.author.username}!`);

		await loading.edit('', { embed: embed });

	},
};