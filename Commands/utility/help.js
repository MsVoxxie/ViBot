const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
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
				.setAuthor({ name: `${bot.user.username}'s Command Sheet`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
				.setThumbnail(message.guild.iconURL({ dynamic: true }))
				.setDescription(
					`Command Prefix» ${settings.prefix}\nFor more details use» \`${settings.prefix}help <command>\`\n${Vimotes['ERROR']} Represents a Disabled Module.\n🔒 Represents a Locked Command.\n${Vimotes['CHANGED']} Represents a command converted into Slash (/).\n\n**${Cap}**`
				)
				.addFields({ name: `${settings.disabledModules.includes(Cat) ? `${Vimotes['ERROR']}${Cap}` : Cap} [${dir.size}] »`, value: dir.map((command) =>`${command.ownerOnly ? '🔒' : ''}${command.converted ? `${Vimotes['CHANGED']}` : ''}**${command.name}** » ${command.description ? command.description : ''}`).join('\n') })
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
				.setAuthor({ name: `${bot.user.username}'s Command Sheet`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
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
				`**This guilds prefix is»** ${settings.prefix}\n${command.name ? `**Command»**  ${command.name}\n` : ''}${
					command.aliases.length ? `**Aliases»** ${command.aliases.join(' | ')}\n` : ''
				}${command.example ? `**Example»** ${settings.prefix}${command.example}\n` : ''}${
					settings.disabledModules.includes(command.category)
						? `**Status»** ${Vimotes['ERROR']}Disabled.\n`
						: `**Status»** ${Vimotes['AUTHORIZED']}Enabled\n`
				}${command.cooldown ? `**Cooldown»** ${command.cooldown}\n` : ''}${
					command.description ? `**Description»** ${command.description}\n` : ''
				}${
					command.userPerms.length ? `**Required User Permissions»** ${command.userPerms.map((perm) => permissions[perm]).join(' | ')}\n` : ''
				}${command.botPerms.length ? `**Required Bot Permissions»** ${command.botPerms.map((perm) => permissions[perm]).join(' | ')}\n` : ''}`
			);
			await message.reply({ embeds: [helpEmbed] });
		} else {
			// Send pagination
			const embedList = await message.reply({
				content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
				embeds: [embeds[currentPage]],
			});

			// Apply Reactions
			try {
				const Buttons = new MessageActionRow().addComponents(
					new MessageButton().setLabel('Back').setStyle('SUCCESS').setCustomId('BACK'),
					new MessageButton().setLabel('Stop').setStyle('DANGER').setCustomId('STOP'),
					new MessageButton().setLabel('Cancel').setStyle('DANGER').setCustomId('CANCEL'),
					new MessageButton().setLabel('Next').setStyle('SUCCESS').setCustomId('NEXT')
				);
				await embedList.edit({ components: [Buttons] });
			} catch (error) {
				console.error(error);
			}

			const filter = (interaction) => message.author.id === interaction.user.id;
			const collector = await embedList.createMessageComponentCollector({ filter, time: 300 * 1000 });
			collector.on('collect', async (interaction) => {
				await interaction.deferUpdate();
				// Switch Case
				switch (interaction.customId) {
					// Backwards
					case 'BACK': {
						if (currentPage !== 0) {
							currentPage--;
							embedList.edit({
								content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
								embeds: [embeds[currentPage]],
							});
						}
						break;
					}

					// Stop
					case 'STOP': {
						collector.stop();
						embedList.edit({ content: '**«Collection Stopped»**', components: [] });
						break;
					}

					// Cancel
					case 'CANCEL': {
						await embedList.delete();
						collector.stop();
						break;
					}

					// Forwards
					case 'NEXT': {
						if (currentPage < embeds.length - 1) {
							currentPage++;
							embedList.edit({
								content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
								embeds: [embeds[currentPage]],
							});
						}
						break;
					}
				}
			});

			//Tell users the collection ended when it has.
			collector.on('end', async () => {
				if (embedList.length) {
					await embedList.edit({ content: '**«Collection Stopped»**', components: [] });
				}
				message?.delete();
			});
		}
	},
};
