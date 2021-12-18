const { MessageEmbed } = require('discord.js');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { readdirSync } = require('fs');

module.exports = {
	name: 'help',
	aliases: ['h'],
	description: 'Displays my commands list and their details!',
	example: 'help help',
	category: 'utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		// Setup
		const cmd = args[0];
		const Categories = readdirSync('./Commands/');
		const embeds = [];
		let currentPage = 0;

		// Generate Pagination
		Categories.forEach((Cat) => {
			//Category Checks
			if (settings.allownsfw === false && Cat === 'nsfw') return;
			if (Cat === 'owner only') return;

			//Check for permissions of user
			if (Cat === 'config' && !message.member.permissions.has(['MANAGE_GUILD', 'MANAGE_ROLES'])) return;

			//Command Checks
			const dir = bot.commands.filter((c) => {
				if (settings.allownsfw === false && c.nsfw) return;
				if (!c.hidden) {
					return c.category === Cat;
				}
			});

			// Slice first letter and make it uppercase
			const Cap = Cat.slice(0, 1).toUpperCase() + Cat.slice(1);

			// Setup Embed pages
			const embed = new MessageEmbed()
				.setAuthor(`${bot.user.username}'s Command Sheet`, bot.user.displayAvatarURL({ dynamic: true }))
				.setThumbnail(message.guild.iconURL({ dynamic: true }))
				.setDescription(`Command Prefix› ${settings.prefix}\nFor more details use› \`${settings.prefix}help <command>\`\n${Vimotes['XMARK']} Represents a Disabled Module.\n🔒 Represents a Locked Command.`)
				.addField(
					`${settings.disabledModules.includes(Cat) ? `${Vimotes['XMARK']}${Cap}` : Cap} [${dir.size}] ›`,
					dir.map((command) => `${command.ownerOnly ? '🔒' : ''}**${command.name}** › ${command.description ? command.description : ''}`).join('\n')
				)
				.setColor(settings.guildcolor);

			embeds.push(embed);
			embeds.sort();
			return embeds;
		});

		// Is the user requesting details?
		if (cmd) {
			// Define what a 'Command' is.
			const command = bot.commands.get(bot.aliases.get(cmd.toLowerCase()) || cmd.toLowerCase());

			// Init Embed
			const helpEmbed = new MessageEmbed()
				.setAuthor(`${bot.user.username}'s Command Sheet`, bot.user.displayAvatarURL({ dynamic: true }))
				.setThumbnail(message.guild.iconURL({ dynamic: true }))
				.setColor(settings.guildcolor);

			// Check if its valid
			if (!command) {
				helpEmbed.setTitle('Invalid Command');
				helpEmbed.setDescription(`Use \`${settings.prefix}help\` for my command list.`);
				return await message.reply({ embeds: [helpEmbed] }).then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
				});
			}

			// If Valid, Generate information sheet
			helpEmbed.setDescription(
				`**This guilds prefix is›** ${settings.prefix}\n${command.name ? `**Command›**  ${command.name}\n` : ''}${command.aliases.length ? `**Aliases›** ${command.aliases.join(' | ')}\n` : ''}${
					command.example ? `**Example›** ${settings.prefix}${command.example}\n` : ''
				}${settings.disabledModules.includes(command.category) ? `**Status›** ${Vimotes['XMARK']}Disabled.\n` : `**Status›** ${Vimotes['AUTHORIZED']}Enabled\n`}${
					command.cooldown ? `**Cooldown›** ${command.cooldown}\n` : ''
				}${command.description ? `**Description›** ${command.description}\n` : ''}${command.userPerms.length ? `**Required User Permissions›** ${command.userPerms.map((perm) => permissions[perm]).join(' | ')}\n` : ''}${
					command.botPerms.length ? `**Required Bot Permissions›** ${command.botPerms.map((perm) => permissions[perm]).join(' | ')}\n` : ''
				}`
			);
			await message.reply({ embeds: [helpEmbed] });
		} else {
			// Send pagination
			const embedList = await message.reply({
				content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`,
				embeds: [embeds[currentPage]],
			});

			// Apply Reactions
			try {
				await embedList.react('◀');
				await embedList.react('⏹');
				await embedList.react('▶');
			} catch (error) {
				console.error(error);
			}

			// Filter Reactions, setup Collector and try each reaction
			const filter = (reaction, user) => ['◀', '⏹', '▶'].includes(reaction.emoji.name) && message.author.id === user.id;
			const collector = await embedList.createReactionCollector({ filter, time: 300 * 1000 });
			collector.on('collect', async (reaction) => {
				// Switch Case
				switch (reaction.emoji.name) {
					// Backwards
					case '◀': {
						await reaction.users.remove(message.author.id);
						if (currentPage !== 0) {
							currentPage--;
							embedList.edit({
								content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`,
								embeds: [embeds[currentPage]],
							});
						}
						break;
					}

					// Stop
					case '⏹': {
						collector.stop();
						reaction.message.reactions.removeAll();
						embedList.edit('**«Collection Stopped»**');
						break;
					}

					// Forwards
					case '▶': {
						await reaction.users.remove(message.author.id);
						if (currentPage < embeds.length - 1) {
							currentPage++;
							embedList.edit({
								content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`,
								embeds: [embeds[currentPage]],
							});
						}
						break;
					}
				}
			});
		}
	},
};
