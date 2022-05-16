const { userData, BotData } = require('../../Storage/Database/models/index.js');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');
const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		if (!message.guild)
			return message.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.warning,
						text: `${Vimotes['ALERT']} Sorry, Commands can only be used in guilds!`,
					}),
				],
			});

		// Get Guild Settings
		const settings = await bot.getGuild(message.guild);

		// Member declaration
		const member = await message.member;

		//Increase messages sent.
		await userData.findOneAndUpdate(
			{ guildid: message.guild.id, userid: message.author.id },
			{ $inc: { totalmessages: 1 } },
			{ upsert: true, new: true }
		);

		//Bots cant execute commands.
		if (message.author.bot) return;

		//People were nice to me, show them a nice emoji.
		const tyRegex = /(danke|thank you|thank u|thanks|ty) vi/gi;
		if (tyRegex.test(message.content)) {
			await BotData.findOneAndUpdate({}, { $inc: { totalthanks: 1 } }, { upsert: true, new: true });
			await message.react('💕');
		}

		// Setup Prefix
		const prefixMention = new RegExp(`^<@!?${bot.user.id}> `);
		const prefixes = [settings ? settings.prefix : '?', message.content.match(prefixMention) ? message.content.match(prefixMention[0]) : '?'];
		const prefix = await prefixes.find((p) => message.content.startsWith(p));

		// Setup Conditionals
		if (!message.content.startsWith(prefix)) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const cmd = args.shift().toLowerCase();
		if (cmd.length === 0) return;

		// Command Checks
		let command = bot.commands.get(cmd);
		if (!command) command = bot.commands.get(bot.aliases.get(cmd));
		if (!command) return;

		// Check if Owner Only
		if (command.ownerOnly && !bot.Owners.includes(member.id)) {
			return message.reply(`Sorry, The command \`${command.name}\` is locked.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check if Disabled Globally
		if (command.disabled && command.disabled === true) {
			return message.reply(`Sorry, The command \`${command.name}\` is disabled.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check if Disabled in Guild
		if (settings.disabledModules.includes(command.category)) {
			return message.reply(`Sorry, The category \`${command.category}\` has been disabled for this guild.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		if (command.converted)
			return message.reply({
				embeds: [
					bot.replyEmbed({
						color: bot.colors.warning,
						text: `${Vimotes['ALERT']} **${command.name}** has been converted into a Slash (/) command!`,
					}),
				],
			});

		// Check if args required
		if (command.args && !args.length) {
			return message.reply(`The command \`${command.name}\` requires arguments, you did not provide any!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		//Check if Guild Allows Nsfw
		if (settings.allownsfw === false && command.nsfw) {
			return message.reply('Sorry, This guild has disable NSFW Commands.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check NSFW
		if (!message.channel.nsfw && command.nsfw) {
			return message.reply('Sorry, this command can only be used in channels marked as NSFW').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check for permissions of user
		if (command.userPerms) {
			const usermissing = message.channel.permissionsFor(message.author).missing(command.userPerms);
			if (usermissing.length > 0) {
				return message
					.reply(
						`Sorry, The command \`${command.name}\` requires the following permissions:\n\`${usermissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
			}
		}

		// Check for bot permissions
		if (command.botPerms) {
			const botmissing = message.channel.permissionsFor(message.guild.me).missing(command.botPerms);
			if (botmissing.length > 0) {
				return message
					.reply(
						`I cannot execute the command \`${command.name}\`, I'm missing the the following permissions:\n\`${botmissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
			}
		}

		// Command Cooldowns
		if (command.cooldown) {
			if (!bot.cooldowns.has(command.name)) {
				bot.cooldowns.set(command.name, new Discord.Collection());
			}

			const now = Date.now();
			const timestamps = bot.cooldowns.get(command.name);
			const cooldownAmount = (command.cooldown || 3) * 1000;

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = expirationTime - now;
					return message
						.reply({
							embeds: [
								bot.replyEmbed({
									color: bot.colors.warning,
									text: `${Vimotes['ALERT']} Please wait, You have \`${ms(timeLeft, { long: true })}\` left until you can reuse \`${
										command.name
									}\`.`,
								}),
							],
						})
						.then((s) => {
							if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
						});
				}
			}

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		}

		// Execute command
		try {
			await userData.findOneAndUpdate(
				{ guildid: message.guild.id, userid: message.author.id },
				{ $inc: { commandsused: 1 } },
				{ upsert: true, new: true }
			);
			await command.execute(bot, message, args, settings, Vimotes);
		} catch (e) {
			console.error(e);
			message.reply(`Uh Oh, There was an error trying to execute \`${command.name}\``);
		}
	},
};
