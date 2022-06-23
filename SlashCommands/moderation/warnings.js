const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warnings')
		.setDescription('Get a users warnings')
		.addUserOption((option) => option.setName('user').setDescription('The user to get warnings for').setRequired(false))
		.addStringOption((option) => option.setName('warningid').setDescription('The warning to view').setRequired(false)),
	options: {
		ownerOnly: false,
		userPerms: ['KICK_MEMBERS'],
		botPerms: ['MANAGE_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Declarations
		let member;
		let memberTarget = null;
		if (interaction.options.getUser('user')) {
			memberTarget = await intGuild.members.fetch(interaction.options.getUser('user')?.id);
		}
		const warningId = await interaction.options.getString('warningid');

		if (!memberTarget && !warningId)
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ERROR']} You must specify a user or a warningId.` })],
			});

		//Get all of a users warnings
		if ((memberTarget && !warningId) || !warningId.length === 32) {
			const userWarnings = await Warning.find({ guildid: intGuild.id, userid: memberTarget.id }).limit(10).lean();
			userWarnings.sort((a, b) => a.date - b.date);
			if (!userWarnings.length)
				return interaction.reply({
					embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} ${memberTarget} has no warnings.` })],
					ephemeral: true,
				});

			//Setup Embed
			const listEmbed = new MessageEmbed().setColor(settings.guildcolor).setAuthor({
				name: `${userWarnings.length} Warnings for ${memberTarget.user.tag}`,
				iconURL: memberTarget.displayAvatarURL({ dynamic: true }),
			});

			//Add Warnings to Embed
			let counter = 0;
			for await (const warning of userWarnings) {
				//Increasing Counter
				counter++;
				//Get the moderator who warned the user
				const moderator = await intGuild.members.fetch(warning.moderator);
				//Add Fields
				listEmbed.addField(
					`${counter} | Moderator: ${moderator.user.tag}`,
					`**Nickname:** ${warning.usernick}\n**Reason:** ${warning.reason}\n**Date:** ${bot.Timestamp(warning.date)}\n**Warning ID:** ${
						warning.warningid
					}`
				);
			}

			//Send Embed
			return await interaction.reply({ embeds: [listEmbed] });
		}

		//Get the warning by ID
		if (warningId && warningId.length === 32) {
			//Get Warning
			const userWarning = await Warning.find({ guildid: intGuild.id, warningid: warningId });
			if (!userWarning[0])
				return interaction.reply({
					embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} No warning with that ID exists.` })],
					ephemeral: true,
				});
			//Get the user
			try {
				member = await intGuild.members.fetch(userWarning[0].userid);
			} catch (e) {
				if (!member) member = null;
			}

			//Get the moderator who warned the user
			let moderator = await intGuild.members.fetch(userWarning[0].moderator);
			if (!moderator) moderator = null;

			//Setup Embed
			const singleEmbed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setAuthor({
					name: `Warning for ${member ? member.user.tag : userWarning[0].usernick}`,
					iconURL: member?.displayAvatarURL({ dynamic: true }),
				})
				.addField(
					`Moderator: ${moderator ? moderator.user.tag : 'Unable to retrieve moderator'}`,
					`**Nickname:** ${userWarning[0].usernick}\n**Reason:** ${userWarning[0].reason}\n**Date:** ${bot.Timestamp(
						userWarning[0].date
					)}\n**Warning ID:** ${userWarning[0].warningid}`
				);

			//Send Embed
			return await interaction.reply({ embeds: [singleEmbed] });
		}
	},
};
