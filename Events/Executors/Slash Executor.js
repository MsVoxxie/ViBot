const { userData } = require('../../Storage/Database/models/index.js');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');
const { Collection } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'interactionCreate',
	disabled: false,
	once: false,
	async execute(interaction, bot) {
		//Are we in a guild?
		if (!interaction.guild)
			return interaction.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.warning,
						text: `${Vimotes['ALERT']} Sorry, Commands can only be used in guilds!`,
					}),
				],
				ephemeral: true,
			});

		//Who used the command
		const intGuild = interaction?.guild;
		const intMember = await intGuild?.members.fetch(interaction.user.id);

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
		if (options.ownerOnly && !bot.Owners.includes(interaction.user.id))
			return interaction.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.warning,
						text: `${Vimotes['ALERT']} Sorry, The command \`${command.data.name}\` is locked.`,
					}),
				],
				ephemeral: true,
			});

		// Check for permissions of user
		if (options.userPerms) {
			const usermissing = interaction.channel.permissionsFor(interaction.user).missing(options.userPerms);
			if (usermissing.length > 0)
				return interaction.reply({
					embeds: [
						bot.replyEmbed({
							color: bot.colors.warning,
							text: `${Vimotes['ALERT']} Sorry, The command \`${command.data.name}\` requires the following permissions:\n\`${usermissing
								.map((perm) => permissions[perm])
								.join(', ')}\``,
						}),
					],
					ephemeral: true,
				});
		}

		// Check for permissions of user
		if (options.botPerms) {
			const botmissing = interaction.channel.permissionsFor(interaction.guild.me).missing(options.userPerms);
			if (botmissing.length > 0) {
				return interaction.reply({
					embeds: [
						bot.replyEmbed({
							color: bot.colors.warning,
							text: `${Vimotes['ALERT']} I cannot execute the command \`${
								command.data.name
							}\`, I'm missing the the following permissions:\n\`${botmissing.map((perm) => permissions[perm]).join(', ')}\``,
						}),
					],
					ephemeral: true,
				});
			}
		}

		// Command Cooldowns
		if (options.cooldown) {
			if (!bot.slash_cooldowns.has(interaction.commandName)) {
				bot.slash_cooldowns.set(interaction.commandName, new Collection());
			}

			const now = Date.now();
			const timestamps = bot.slash_cooldowns.get(interaction.commandName);
			const cooldownAmount = (options.cooldown || 3) * 1000;

			if (timestamps.has(intMember.id)) {
				const expirationTime = timestamps.get(intMember.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = expirationTime - now;
					return interaction.reply({
						embeds: [
							bot.replyEmbed({
								color: bot.colors.warning,
								text: `${Vimotes['ALERT']} Please wait, You have \`${ms(timeLeft, { long: true })}\` left until you can reuse \`${
									interaction.commandName
								}\`.`,
							}),
						],
						ephemeral: true,
					});
				}
			}

			timestamps.set(intMember.id, now);
			setTimeout(() => timestamps.delete(intMember.id), cooldownAmount);
		}

		//Execute the command
		try {
			await userData.findOneAndUpdate(
				{ guildid: intGuild.id, userid: intMember.id },
				{ $inc: { commandsused: 1 } },
				{ upsert: true, new: true }
			);
			await command.execute(bot, interaction, intGuild, intMember, settings, Vimotes);
		} catch (error) {
			console.error(error);
			return interaction.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.warning,
						text: `${Vimotes['ALERT']} There was an error while executing this command!`,
					}),
				],
				ephemeral: true,
			});
		}
	},
};
