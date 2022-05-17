const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 99 messages.')
		.addIntegerOption((option) => option.setName('count').setDescription('The number of messages to prune. (max 99)').setMinValue(1).setMaxValue(99).setRequired(true) )
		.addUserOption((option) => option.setName('user').setDescription('The user to prune messages from. (Optional)')),

	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_MESSAGES'],
		botPerms: ['MANAGE_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const count = interaction.options.getInteger('count');
		const user = interaction.options.getUser('user');

		//Check if count is too high.
		if (count < 1 || count > 99) {
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} Value must be between 1 and 99!` })],
				ephemeral: true,
			});
		}

		if (user) {
			await interaction.channel.messages.fetch({ limit: count }).then(async (messages) => {
				let filterMsg = await messages.filter((m) => m.author.id === user.id);
				await interaction.channel.bulkDelete(filterMsg);
				return interaction.reply({
					embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Deleted ${count} messages from ${user}.` })],
					ephemeral: true,
				});
			});
		} else {
			await interaction.channel.bulkDelete(count, true).catch((err) => {
				console.log(err);
				return interaction.reply({
					embeds: [
						bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} There was an error pruning messages in this channel!` }),
					],
					ephemeral: true,
				});
			});
			return interaction.reply({
				embeds: [
					bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Deleted ${count} messages from ${interaction.channel}!` }),
				],
				ephemeral: true,
			});
		}
	},
};
