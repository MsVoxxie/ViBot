const { permissions } = require('../../Storage/Functions/miscFunctions');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

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

		//Get the Command Options
		const options = command.options;

		//Check if owner only
		if (options.ownerOnly && !bot.Owners.includes(interaction.user.id)) {
			return interaction.reply(`Sorry, The command \`${command.data.name}\` is owner only.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check for permissions of user
		if (options.userPerms) {
			const usermissing = interaction.channel.permissionsFor(interaction.user).missing(options.userPerms);
			if (usermissing.length > 0) {
				return interaction
					.reply(
						`Sorry, The command \`${command.data.name}\` requires the following permissions:\n\`${usermissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
			}
		}

		// Check for permissions of user
		if (options.botPerms) {
			const botmissing = interaction.channel.permissionsFor(interaction.guild.me).missing(options.userPerms);
			if (botmissing.length > 0) {
				return interaction
					.reply(
						`I cannot execute the command \`${command.data.name}\`, I'm missing the the following permissions:\n\`${botmissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
			}
		}

		//Execute the command
		try {
			await command.execute(bot, interaction, intGuild, intMember, settings, Vimotes);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
