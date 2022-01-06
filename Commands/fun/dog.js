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
		const loading = await message.reply(`${Vimotes['A_LOADING']}Finding a Dog for you...`);
		await fetch('https://dog.ceo/api/breeds/image/random')
			.then((r) => r.json())
			.then((j) => (dog = j));

		const embed = new MessageEmbed()
			.setImage(`${dog.message.toString()}`)
			.setTitle('Random Dog!')
			.setURL(dog.message.toString())
			.setColor(settings.guildcolor)
			.setFooter({ text: `A dog for ${message.author.username}!` });

		await loading.edit({ content: null, embeds: [embed] });
	},
};
