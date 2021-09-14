const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'avatar',
	aliases: ['av'],
	description: 'Get your own or a users Avatar',
	example: 'av @user | av',
	category: 'Utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		let user = (await message.mentions.users.first()) || (await message.author);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor(`Avatar for ${user.username}`, user.displayAvatarURL({ dynamic: true }))
			.setImage(user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
			.setFooter(`Requested by ${message.author.username}`);

		//Send Message
		message.channel.send({ embeds: [embed] });
	},
};
