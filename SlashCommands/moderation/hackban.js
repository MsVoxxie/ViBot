const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hackban')
		.setDescription('Ban a user that is not in the guild')
		.addStringOption((option) => option.setName('id').setDescription('The id of the user to ban.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for banning the user.').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['BAN_MEMBERS'],
		botPerms: ['BAN_MEMBERS'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Definitions
		const userId = interaction.options.getString('id');
		const reason = interaction.options.getString('reason');
		const idCheck = /^[0-9]{18}/;

		if (!idCheck.test(userId))
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} This is not a user ID!` })],
				ephemeral: true,
			});

		//Dont ban yourself...
		if (userId === intMember.id)
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} You cannot ban yourself.` })],
				ephemeral: true,
			});

		//Ban the user
		try {
			await intGuild.bans.create(userId, { reason: reason }).then(() => {
				return interaction.reply({
					embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Banned the ID ${userId}.` })],
					ephemeral: true,
				});
			});
		} catch (err) {
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} I could not ban the ID ${userId}.` })],
				ephemeral: true,
			});
		}
	},
};
