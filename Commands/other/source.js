const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'source',
	aliases: [],
	description: 'Gets my source code',
	example: '',
	category: 'other',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		const embed = new MessageEmbed()
			.setTitle('__**ViBot\'s Code**__')
			.setColor('#700707')
			.setThumbnail('https://share.voxxie.me/images/VoxelIco.png')
			.setDescription('Source Code can be found [Here on Github](https://github.com/MsVoxxie/ViBot/tree/master)\nMy Creator is 👑 Ms.Voxxie#0001\nCreate an Issue if anything comes up!');

		message.channel.send({ embeds: [embed] });
	},
};