const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user from the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for banning the user').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('days')
				.setDescription('Delete past messages?')
				.addChoices({ name: 'Don\'t Delete', value: '0' })
				.addChoices({ name: 'Past 24 hours', value: '1' })
				.addChoices({ name: 'Past week', value: '7' })
				.setRequired(true)
		),
	options: {
		ownerOnly: false,
		userPerms: ['BAN_MEMBERS'],
		botPerms: ['BAN_MEMBERS'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Definitions
		const member = await intGuild.members.fetch(interaction.options.getUser('user').id);
		const reason = interaction.options.getString('reason');
		const days = interaction.options.getString('days');

		//Dont ban yourself...
		if (member.id === intMember.id)
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['ERROR']} You cannot ban yourself.` })],
				ephemeral: true,
			});

		//Check if the user is bannable
		if (!member.bannable || member.permissions.has('BAN_MEMBERS'))
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['ERROR']} I cannot ban ${member}` })],
				ephemeral: true,
			});

		//Ban the user
		try {
			await member.ban({ days: days, reason: reason });
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Banned ${member}.` })],
				ephemeral: true,
			});
		} catch (err) {
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['ERROR']} I could not ban ${member}.` })],
				ephemeral: true,
			});
		}
	},
};
