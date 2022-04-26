const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'avatar',
	aliases: ['av'],
	description: 'Get your own or a users Avatar',
	example: 'av @user | av',
	category: 'Utility',
	args: false,
	converted: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		let Getmember = (await message.mentions.members.first()) || (await message.member);
		const member = await message.guild.members.fetch(Getmember.id);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor({ name: `Avatar for ${member.displayName}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
			.setImage(member.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
			.setFooter({ text: `Requested by ${message.member.displayName}` });

		//Send Message
		message.channel.send({ embeds: [embed] });
	},
};
