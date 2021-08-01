const { MessageEmbed } = require('discord.js');
const googleSearch = require('g-i-s');

module.exports = {
	name: 'imagesearch',
	aliases: ['img', 'isearch'],
	description: 'Search google for images',
	example: '<query>',
	category: 'utility',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// Declarations
		const imgResults = [];
		const embeds = [];
		let currentPage = 0;

		// Let the user know i;m working...
		const loading = await message.reply(`${Vimotes['A_LOADING']}Gathering image results...`);

		// Search and save results
		await googleSearch(args.join(' '), Results);
		async function Results(error, results) {
			if (error) return message.reply('Search Query failed.');
			for (let i = 0; i < results.length; i++) {
				imgResults.push(results[i].url);
			}

			// Setup Pagination
			imgResults.forEach((res) => {
				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setAuthor(
						`${message.member.nickname ? message.member.nickname : message.member.user.username}`,
						message.member.user.displayAvatarURL({ dynamic: true })
					)
					.setImage(res)
					.setTimestamp(Date.now());

				embeds.push(embed);
				embeds.sort();
				return embeds;
			});

			// Send pagination
			const embedList = await loading.edit(
				`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`,
				{ embed: embeds[currentPage] }
			);

			// Apply Reactions
			try {
				await embedList.react('◀');
				await embedList.react('⏹');
				await embedList.react('▶');
			} catch (e) {
				console.error(e);
			}

			// Filter Reactions, setup Collector and try each reaction
			const filter = (reaction, user) =>
				['◀', '⏹', '▶'].includes(reaction.emoji.name) && message.author.id === user.id;
			const collector = embedList.createReactionCollector(filter, { time: 300 * 1000 });
			collector.on('collect', async (reaction) => {
				// Switch Case
				switch (reaction.emoji.name) {
					// Backwards
					case '◀': {
						await reaction.users.remove(message.author.id);
						if (currentPage !== 0) {
							currentPage--;
							embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, {
								embed: embeds[currentPage],
							});
						}
						break;
					}

					// Stop
					case '⏹': {
						collector.stop();
						reaction.message.reactions.removeAll();
						embedList.edit('**«Collection Stopped»**', { embed: embeds[currentPage] });
						break;
					}

					// Forwards
					case '▶': {
						await reaction.users.remove(message.author.id);
						if (currentPage < embeds.length - 1) {
							currentPage++;
							embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, {
								embed: embeds[currentPage],
							});
						}
						break;
					}
				}
			});
		}
	},
};
