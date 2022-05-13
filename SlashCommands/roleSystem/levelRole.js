const { nanoid } = require('nanoid');
const { MessageEmbed } = require('discord.js');
const { Levelroles } = require('../../Storage/Database/models/');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levelroles')
		.setDescription('Create a level role.')
		.addRoleOption((option) => option.setName('role').setDescription('The role you would like to add.').setRequired(true))
		.addIntegerOption((option) => option.setName('level').setDescription('The level to link the role to.').setRequired(true).setMinValue(1)),
	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_ROLES'],
		botPerms: ['MANAGE_ROLES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Check if the server has the leveling system enabled.
		const levelChannel = await intGuild.channels.cache.get(settings.levelchannel);
		if (!levelChannel)
			return interaction.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.error,
						text: `${Vimotes['XMARK']} The leveling system is not enabled on this server.`,
					}),
				],
				ephemeral: true,
			});

		//Create unique identifier
		const identifier = nanoid(8);

        //Database Info
		await Levelroles.create({
			guildid: intGuild.id,
			level: interaction.options.getInteger('level'),
			roleidentifier: identifier,
			roleid: interaction.options.getRole('role').id,
		});

		//Create Embed
		const embed = new MessageEmbed()
			.setTitle('Level Role Created')
			.setDescription(`Level Role ID› \`${identifier}\`\nRole› ${interaction.options.getRole('role')}\nLevel› ${interaction.options.getInteger('level')}`)
			.setColor(settings.guildcolor);

		await interaction.reply({ embeds: [embed] });
	},
};
