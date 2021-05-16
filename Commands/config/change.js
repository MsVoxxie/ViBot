module.exports = {
	name: 'change',
	aliases: [],
	description: 'Update this guilds database settings',
	example: '',
	category: 'config',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	requiredRoles: [],
	userPerms: ['ADMINISTRATOR'],
	botPerms: [],
	async execute(bot, message, args, settings) {

		// Define arguments
		const param = args[0];
		let newSetting = args.slice(1).join(' ');
		const guild = await message.guild;

		// Switch Case
		switch (param) {

		// Prefix
		case 'prefix': {
			if (!newSetting) return message.lineReply(`Prefix is currently \`${settings.prefix}\``).then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			try {
				await bot.updateGuild(guild, { prefix: newSetting });
				return message.lineReply(`**Guild Prefix Updated›** \`${newSetting}\``).then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			}
			catch (error) {
				message.lineReply('**Failed to update Prefix, Please try again.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			}
			break;
		}

		// Guildcolor
		case 'guildcolor': {
			if (!newSetting) return message.lineReply(`**Guild Color is currently›** \`${settings.guildcolor}\``).then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			if(!bot.isHex(newSetting)) return message.lineReply(`\`${newSetting}\` is not a valid hexadecimal color code, Aborting.`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			if (!newSetting.split('').includes('#')) { newSetting = `#${newSetting}`; }
			try {
				await bot.updateGuild(guild, { guildcolor: newSetting });
				return message.lineReply(`**Guild Color Updated›** \`${newSetting}\``).then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			}
			catch (error) {
				message.lineReply('**Failed to update Guild Color, Please try again.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			}
			break;
		}

		// Prune
		case 'prune': {
			if(!newSetting) return message.lineReply(`**Prune is currently set to \`${settings.prune}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			try {
				await bot.updateGuild(guild, { prune: newSetting });
				return message.lineReply(`**Prune Updated›** \`${newSetting}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			catch (error) {
				message.lineReply('**Failed to update prune, Please try again.').then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			break;
		}

		// Audit
		case 'audit': {
			if(!newSetting) return message.lineReply(`**Audit is currently set to \`${settings.audit}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			try {
				await bot.updateGuild(guild, { audit: newSetting });
				return message.lineReply(`**Audit Updated›** \`${newSetting}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			catch (error) {
				message.lineReply('**Failed to update audit, Please try again').then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			break;
		}

		// AuditChannel
		case 'auditchannel': {
			if(!newSetting) return message.lineReply(`**AuditChannel is currently set to \`${settings.auditchannel}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			try {
				const chan = await message.mentions.channels.first();
				await bot.updateGuild(guild, { auditchannel: chan });
				return message.lineReply(`**AuditChannel Updated›** ${chan}`).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			catch (error) {
				message.lineReply('**Failed to update auditchannel, Please try again').then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
			}
			break;
		}

		}
	},
};