const { permissions } = require('../../Storage/Functions/miscFunctions');

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
		const prefixes = [settings ? settings.prefix : '?', message.content.match(prefixMention) ? message.content.match(prefixMention[0]) : '?'];
		const prefix = await prefixes.find(p => message.content.startsWith(p));

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
			return message.lineReply(`Sorry, The command \`${command.name}\` is locked.`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		}

		// Check if Disabled Globally
		if(command.disabled && command.disabled === true) {
			return message.lineReply(`Sorry, The command \`${command.name}\` is disabled.`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		}

		// Check if Disabled in Guild
		if(settings.disabledModules.includes(command.category)) {
			return message.lineReply(`Sorry, The category \`${command.category}\` has been disabled for this guild.`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		}

		// // Check if Mod required
		// if((message.guild.ownerID !== message.author.id) || command.modRequired == true && !message.member.roles.cache.has(settings.modrole)) {
		// 	return message.lineReply(`This command is locked to \`${message.guild.roles.cache.get(settings.modrole) ? message.guild.roles.cache.get(settings.modrole).name : 'Role not set...'}\` only.`);
		// }

		// // Check if Admin required
		// if((message.guild.ownerID !== message.author.id) || command.adminRequired == true && !message.member.roles.cache.has(settings.adminrole)) {
		// 	return message.lineReply(`This command is locked to \`${message.guild.roles.cache.get(settings.adminrole) ? message.guild.roles.cache.get(settings.adminrole).name : 'Role not set...'}\` only.`);
		// }

		// Check if args required
		if(command.args && !args.length) {
			return message.lineReply(`The command \`${command.name}\` requires arguments, you did not provide any!`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		}

		// Check NSFW
		if(!message.channel.nsfw && command.nsfw) {
			return message.lineReply('Sorry, this command can only be used in channels marked as NSFW').then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		}

		// Check for permissions of user || TO BE DEPRICATED ||
		if (command.userPerms) {
			const usermissing = message.channel.permissionsFor(message.author).missing(command.userPerms);
			if (usermissing.length > 0) {
				return message.lineReply(`Sorry, The command \`${command.name}\` requires the following permissions:\n\`${usermissing.map(perm => permissions[perm]).join(', ')}\``).then(s => s.delete({ timeout: 30 * 1000 })).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
		}

		// Check for bot permissions
		if (command.botPerms) {
			const botmissing = message.channel.permissionsFor(message.guild.me).missing(command.botPerms);
			if (botmissing.length > 0) {
				return message.lineReply(`I cannot execute the command \`${command.name}\`, I'm missing the the following permissions:\n\`${botmissing.map(perm => permissions[perm]).join(', ')}\``).then(s => s.delete({ timeout: 30 * 1000 })).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
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
