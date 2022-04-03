module.exports = {
	name: 'interactionCreate',
	disabled: false,
	once: false,
	async execute(interaction, bot) {
		//Who used the command
		const intGuild = interaction.guild;
		const intMember = await intGuild.members.fetch(interaction.user.id);

		// Get Guild Settings
		const settings = await bot.getGuild(intGuild);

		//Is it a command?
		if (!interaction.isCommand()) return;

		//Get the Command
		const command = bot.slashCommands.get(interaction.commandName);
		if (!command) return;

		try {
			//Execute the command
			await command.execute(bot, interaction, intGuild, intMember, settings);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
