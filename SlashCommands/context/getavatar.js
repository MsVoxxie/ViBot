const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('getavatar').setType(2),
	async execute(bot, interaction, intGuild, intMember, intTarget, settings, Vimotes) {
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setImage(intTarget.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
			.setFooter({ text: `${intTarget.displayName}'s Avatar` });

		return interaction.reply({ embeds: [embed] });
	},
};
