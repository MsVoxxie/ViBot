const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Display a users avatar, or your own!.')
		.addUserOption((option) => option.setName('user').setDescription("The user's avatar to show")),
	options: {
		cooldown: 2,
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings) {
		const intuser = (await interaction.options.getUser('user')) || intMember;
		const member = await intGuild.members.fetch(intuser.id);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor({ name: `Avatar for ${member.displayName}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
			.setImage(member.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
			.setFooter({ text: `Requested by ${intMember.displayName}` });

		return interaction.reply({ embeds: [embed] });
	},
};
