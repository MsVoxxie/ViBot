const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

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
	async execute(bot, message, args, settings) {

		// Setup
		const cmd = args[0];
		const Categories = readdirSync('./Commands/');
		const embeds = [];
		let currentPage = 0;

		// Generate Pagination
		Categories.forEach(Cat => {
			const dir = bot.commands.filter(c => {
				if (!c.hidden) {
					return c.category === Cat;
				}
			});

			// Slice first letter and make it uppercase
			const Cap = Cat.slice(0, 1).toUpperCase() + Cat.slice(1);

			// Setup Embed pages
			const embed = new MessageEmbed()
				.setAuthor(`${bot.user.username}'s Command Sheet`, bot.user.displayAvatarURL({ dynamic: true }))
				.setThumbnail(message.guild.iconURL({ dynamic: true, size: 64 }))
				.setDescription(`Command Prefix› ${settings.prefix}\nTo view a commands details use› \`${settings.prefix}help <command>\`\n${Vimotes['XMARK']} Represents a Disabled Module.\n🔒 Represents a Locked Command.`)
				.addField(`${settings.disabledModules.includes(Cat) ? `${Vimotes['XMARK']}${Cap}` : Cap} [${dir.size}] ›`, dir.map(command => `${command.ownerOnly ? '🔒' : ''}**${command.name}** › ${command.description ? command.description : ''}`).join('\n'))
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
				return message.lineReply({ embed: helpEmbed }).then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
			}

			// If Valid, Generate information sheet
			helpEmbed.setDescription(`**This guilds prefix is›** ${settings.prefix}\n**Command›**  ${command.name.slice(0, 1).toUpperCase()}${command.name.slice(1)}\n**Aliases›** ${command.aliases.length ? command.aliases.join(' | ') : ''}\n**Example›** ${command.example ? `${settings.prefix}${command.example}` : ''}\n**Status›** ${settings.disabledModules.includes(command.category) ? `${Vimotes['XMARK']}Disabled.` : `${Vimotes['AUTHORIZED']}Enabled`}\n**Cooldown›** ${command.cooldown ? command.cooldown : '2s'}\n**Description›** ${command.description ? command.description : ''}`);
			message.lineReply({ embed: helpEmbed });
		}
		else {

			// Send pagination
			const embedList = await message.lineReply(`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, { embed: embeds[currentPage] });

			// Apply Reactions
			try {
				await embedList.react('◀');
				await embedList.react('⏹');
				await embedList.react('▶');
			}
			catch (error) {
				console.error(error);
			}

			// Filter Reactions, setup Collector and try each reaction
			const filter = (reaction, user) => ['◀', '⏹', '▶'].includes(reaction.emoji.name) && message.author.id === user.id;
			const collector = embedList.createReactionCollector(filter, { time: 300 * 1000 });
			collector.on('collect', async (reaction) => {

				// Switch Case
				switch (reaction.emoji.name) {

				// Backwards
				case '◀': {
					await reaction.users.remove(message.author.id);
					if (currentPage !== 0) {
						currentPage--;
						embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, { embed: embeds[currentPage] });
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
						embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, { embed: embeds[currentPage] });
					}
					break;
				}

				}
			});
		}
	},
};