const { permissions } = require('../Storage/Functions/util');

module.exports = {
	name: 'message',
	disabled: false,
	once: false,
	async execute(message, bot) {

		// Get Guild Settings
		const settings = await bot.getGuild(message.guild);

		// Member declaration
		const member = await message.member;

		// Setup Prefix
		const prefixMention = new RegExp(`^<@!?${bot.user.id}> `);
		const prefixes = ['?', message.content.match(prefixMention) ? message.content.match(prefixMention[0]) : settings.prefix];
		const prefix = await prefixes.find(p => message.content.startsWith(p.toLowerCase()));

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
		if(command.ownerOnly && !bot.Owners.includes(member.id)) {
			return message.lineReply(`Sorry, The command \`${command.name}\` is locked.`);
		}

		// Check if Disabled
		if(command.disabled && command.disabled === true) {
			return message.lineReply(`Sorry, The command \`${command.name}\` is disabled.`);
		}

		// Check if args required
		if(command.args && !args.length) {
			return message.lineReply(`The command \`${command.name}\` requires arguments, you did not provide any!`);
		}

		// Check NSFW
		if(!message.channel.nsfw && command.nsfw) {
			return message.lineReply('Sorry, this command can only be used in channels marked as NSFW');
		}

		// Check for permissions of user
		if (command.userPerms) {
			const usermissing = message.channel.permissionsFor(message.author).missing(command.userPerms);
			if (usermissing.length > 0) {
				return message.lineReply(`Sorry, The command \`${command.name}\` requires the following permissions:\n\`${usermissing.map(perm => permissions[perm]).join(', ')}\``).then(s => s.delete({ timeout: 30 * 1000 }));
			}
		}

		// Check for bot permissions
		if (command.botPerms) {
			const botmissing = message.channel.permissionsFor(message.guild.me).missing(command.botPerms);
			if (botmissing.length > 0) {
				return message.lineReply(`I cannot execute the command \`${command.name}\`, I'm missing the the following permissions:\n\`${botmissing.map(perm => permissions[perm]).join(', ')}\``).then(s => s.delete({ timeout: 30 * 1000 }));
			}
		}

		// Add cooldown later

		// Execute command
		try {
			command.execute(bot, message, args, settings);
		}
		catch (e) {
			console.error(e);
		}
	},
};
