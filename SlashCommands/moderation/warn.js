const { SlashCommandBuilder } = require('@discordjs/builders');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a user')
		.addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for warning the user').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['KICK_MEMBERS'],
		botPerms: ['MANAGE_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Definitions
		const member = await intGuild.members.fetch(interaction.options.getUser('user').id);
		const memberNick = member.nickname || member.user.username;
		const warnDate = Date.now();
		const warningId = await bot.genUniqueId();
		const reason = interaction.options.getString('reason');

		//Checks
		if (intMember.id === member.id)
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} You cannot warn yourself.` })],
				ephemeral: true,
			});
		if (interaction.channel.permissionsFor(member).has(this.options.userPerms[0]))
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} You cannot warn ${member}` })],
				ephemeral: true,
			});

		try {
			//Database Call
			const WarningCall = await Warning.create({
				guildid: intGuild.id,
				userid: member.id,
				usernick: memberNick,
				reason: `${reason ? reason : 'No Reason Provided'}`,
				warningid: warningId,
				moderator: intMember.id,
				date: warnDate,
			});
			await WarningCall.save();

			//Confirmation
			await member.send({
				embeds: [
					bot.replyEmbed({
						color: '#f54242',
						text: `${Vimotes['ALERT']} You were warned in **${intGuild.name}**.\n**Reason:** ${reason ? reason : 'No Reason Provided'}`,
					}),
				],
			});
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Warned ${member}.` })],
				ephemeral: false,
			});
		} catch (e) {
			console.error(e);
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} I could not warn ${member}.` })],
				ephemeral: true,
			});
		}
	},
};