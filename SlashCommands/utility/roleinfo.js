const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roleinfo')
		.setDescription('Show information about a role')
		.addRoleOption((option) => option.setName('role').setDescription('The role to show information about').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const role = interaction.options.getRole('role');
		const colorImage = await bot.createMultiColorCircle([role.hexColor], 256, 45);

        //Generate Embed
        const embed = new MessageEmbed()
            .setAuthor({ name: `${role.name}'s Information`, iconURL: role.iconURL({ dynamic: true }) })
            .setColor(settings.guildcolor)
            .setDescription(`ID» \`${role.id}\`\nHex Code» \`${role.hexColor !== '#000000' ? role.hexColor : 'Transparent'}\`\nMentionable» \`${role.mentionable ? 'Yes' : 'No'}\`\nManaged» \`${role.managed ? 'Yes' : 'No'}\`\nMembers» \`${role.members.size.toString()}\`\nCreated» ${bot.relativeTimestamp(role.createdAt)}`)
			.setThumbnail('attachment://col.png')
		await interaction.reply({ files: [colorImage.attachment], embeds: [embed] });
	},
};