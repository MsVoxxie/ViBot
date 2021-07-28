const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'dog',
	aliases: [],
	description: 'Get a random dog picture!',
	example: 'dog',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		let dog;
		const loading = await message.lineReply(`${Vimotes['A_LOADING']}Finding a Dog for you...`);
		await fetch('https://dog.ceo/api/breeds/image/random').then(r => r.json()).then(j => dog = j);

		const embed = new MessageEmbed()
			.setImage(`${dog.message}`)
			.setTitle('Random Dog!')
			.setURL(dog.message)
			.setColor(settings.guildcolor)
			.setFooter(`A dog for ${message.author.username}!`);

		await loading.edit('', { embed: embed });

	},
};