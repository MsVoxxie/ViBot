const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar.')
		.addUserOption((option) => option.setName('user').setDescription("The user's avatar to show")),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings) {
		const intuser = (await interaction.options.getUser('user')) || interaction.user;
		const member = await intGuild.members.fetch(intuser.id);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor({ name: `Avatar for ${member.displayName}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
			.setImage(member.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
			.setFooter({ text: `Requested by ${intMember.displayName}` });

		return interaction.reply({ embeds: [embed] });
	},
};
