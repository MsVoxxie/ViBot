const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'change',
	aliases: [],
	aliases: ['set', 'update'],
	description: 'Update this guilds database settings',
	example: '',
	category: 'config',
	args: false,
	hidden: true,
	ownerOnly: false,
	userPerms: ['MANAGE_GUILD'],
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
				if (!newSetting)
					return message.reply(`**Prefix is currently \`${settings.prefix}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					await bot.updateGuild(guild, { prefix: newSetting });
					return message.reply(`**Guild Prefix Updated›** \`${newSetting}\``).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update Prefix, Please try again.').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Guildcolor
			case 'guildcolor': {
				if (!newSetting)
					return message.reply(`**Guild Color is currently›** \`${settings.guildcolor}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				if (!bot.isHex(newSetting))
					return message.reply(`\`${newSetting}\` is not a valid hexadecimal color code, Aborting.`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				if (!newSetting.split('').includes('#')) {
					newSetting = `#${newSetting}`;
				}
				try {
					await bot.updateGuild(guild, { guildcolor: newSetting });
					return message.reply(`**Guild Color Updated›** \`${newSetting}\``).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update Guild Color, Please try again.').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Prune
			case 'prune': {
				if (!newSetting)
					return message.reply(`**Prune is currently set to \`${settings.prune}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					await bot.updateGuild(guild, { prune: newSetting });
					return message.reply(`**Prune Updated›** \`${newSetting}\``).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update prune, Please try again.').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Audit
			case 'audit': {
				if (!newSetting)
					return message.reply(`**Audit is currently set to \`${settings.audit}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					await bot.updateGuild(guild, { audit: newSetting });
					return message.reply(`**Audit Updated›** \`${newSetting}\``).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update audit, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// AuditChannel
			case 'auditchannel': {
				if (!newSetting)
					return message.reply(`**AuditChannel is currently set to \`${settings.auditchannel}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					const chan = await message.mentions.channels.first();
					await bot.updateGuild(guild, { auditchannel: chan });
					return message.reply(`**AuditChannel Updated›** ${chan}`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update auditchannel, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Welcome
			case 'welcome': {
				if (!newSetting)
					return message.reply(`**Welcome is currently set to \`${settings.welcome}\`**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					await bot.updateGuild(guild, { welcome: newSetting });
					return message.reply(`**Welcome Update›** \`${settings.newSetting}\``).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update welcome, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Welcome Channel
			case 'welcomechannel': {
				if (!newSetting)
					return message.reply(`**Welcomechannel is currently set to ${settings.welcomechannel}**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					const chan = await message.mentions.channels.first();
					await bot.updateGuild(guild, { welcomechannel: chan });
					return message.reply(`**WelcomeChannel Updated›** ${chan}`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update welcomechannel, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Rules Channel
			case 'ruleschannel': {
				if (!newSetting)
					return message.reply(`**Ruleschannel is currently set to ${settings.ruleschannel}**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					const chan = await message.mentions.channels.first();
					await bot.updateGuild(guild, { ruleschannel: chan });
					return message.reply(`**RulesChannel Updated›** ${chan}`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update ruleschannel, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Mod Role
			case 'modrole': {
				if (!newSetting)
					return message.reply(`**Modrole is currently set to ${settings.modrole}**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					const role = await message.mentions.roles.first();
					await bot.updateGuild(guild, { modrole: role });
					return message.reply(`**ModRole Update›** ${role}`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update modrole, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Admin Role
			case 'adminrole': {
				if (!newSetting)
					return message.reply(`**Adminrole is currently set to ${settings.adminrole}**`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				try {
					const role = await message.mentions.roles.first();
					await bot.updateGuild(guild, { adminrole: role });
					return message.reply(`**AdminRole Update›** ${role}`).then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				} catch (error) {
					message.reply('**Failed to update adminrole, Please try again').then((s) => {
						if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
					});
				}
				break;
			}

			// Default Embed
			default: {
				try {
					const embed = new MessageEmbed()
						.setTitle(`${guild.name}'s Configurations`)
						.setDescription(
							`**prefix›** \`${settings.prefix}\`\n*What prefix should be used for my commands?*\n\n**guildcolor›** \`${settings.guildcolor}\`\n*What HEX color should I use for my various embeds?*\n\n**prune›** \`${settings.prune}\`\n*Should I clean up after myself? (Delete Messages I Create) [true / false]*\n\n**audit›** \`${settings.audit}\`\n*Should I log events? (Message deletions, Updates, etc.) [true / false]*\n\n**auditchannel›** \`${settings.auditchannel}\`\n*What channel should I send audit logs into? (#channelname to update)*\n\n**welcome›** \`${settings.welcome}\`\n*Should I Welcome users into the channel? [true / false]*\n\n**welcomechannel›** \`${settings.welcomechannel}\`\n*What channel should I send welcomes in? (#channelname to update)*\n\n**ruleschannel›** \`${settings.welcomechannel}\`\n*If provided, I will mention to read the rules when welcoming users. (#channelname to update)*\n\n**Alternatively›** [Use My Dashboard](https://bot.voxxie.me/)\n\n`
						)
						.setColor(settings.guildcolor)
						.setFooter({ text: `To update a setting - ${settings.prefix}change <setting> <desired setting>` });

					message.reply({ embeds: [embed] });
				} catch (error) {
					console.error(error);
				}
			}
		}
	},
};
