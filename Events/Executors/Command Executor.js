const Discord = require('discord.js');
const ms = require('ms');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		// Get Guild Settings
		let settings;
		if (message.channel.type !== 'dm') {
			settings = await bot.getGuild(message.guild);
		}
		// Member declaration
		const member = await message.member;

		// Setup Prefix
		const prefixMention = new RegExp(`^<@!?${bot.user.id}> `);
		const prefixes = [
			settings ? settings.prefix : '?',
			message.content.match(prefixMention) ? message.content.match(prefixMention[0]) : '?',
		];
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
				if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check if Disabled Globally
		if (command.disabled && command.disabled === true) {
			return message.reply(`Sorry, The command \`${command.name}\` is disabled.`).then((s) => {
				if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check if Disabled in Guild
		if (settings.disabledModules.includes(command.category)) {
			return message
				.reply(`Sorry, The category \`${command.category}\` has been disabled for this guild.`)
				.then((s) => {
					if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
				});
		}

		// Check if args required
		if (command.args && !args.length) {
			return message
				.reply(`The command \`${command.name}\` requires arguments, you did not provide any!`)
				.then((s) => {
					if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
				});
		}

		//Check if Guild Allows Nsfw
		if (settings.allownsfw === false && command.nsfw) {
			return message.reply('Sorry, This guild has disable NSFW Commands.').then((s) => {
				if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
			});
		}

		// Check NSFW
		if (!message.channel.nsfw && command.nsfw) {
			return message
				.reply('Sorry, this command can only be used in channels marked as NSFW')
				.then((s) => {
					if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
				});
		}

		// Check for permissions of user
		if (command.userPerms) {
			const usermissing = message.channel.permissionsFor(message.author).missing(command.userPerms);
			if (usermissing.length > 0) {
				return message
					.reply(
						`Sorry, The command \`${
							command.name
						}\` requires the following permissions:\n\`${usermissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
					});
			}
		}

		// Check for bot permissions
		if (command.botPerms) {
			const botmissing = message.channel.permissionsFor(message.guild.me).missing(command.botPerms);
			if (botmissing.length > 0) {
				return message
					.reply(
						`I cannot execute the command \`${
							command.name
						}\`, I'm missing the the following permissions:\n\`${botmissing
							.map((perm) => permissions[perm])
							.join(', ')}\``
					)
					.then((s) => {
						if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
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
						.reply(
							`Please wait, You have \`${ms(timeLeft, {
								long: true,
							})}\` left until you can reuse \`${command.name}\`.`
						)
						.then((s) => {
							if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
						});
				}
			}

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		}

		// Execute command
		try {
			command.execute(bot, message, args, settings, Vimotes);
		} catch (e) {
			console.error(e);
			message.reply(`Uh Oh, There was an error trying to execute \`${command.name}\``);
		}
	},
};
