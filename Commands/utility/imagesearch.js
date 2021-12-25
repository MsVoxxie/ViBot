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
					.setAuthor({ name: `${message.member.nickname ? message.member.nickname : message.member.user.username}`, iconURL: message.member.user.displayAvatarURL({ dynamic: true })})
					.setImage(res)
					.setTimestamp(Date.now());

				embeds.push(embed);
				embeds.sort();
				return embeds;
			});

			// Send pagination
			const embedList = await loading.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });

			// Apply Reactions
			try {
				await embedList.react('◀');
				await embedList.react('⏹');
				await embedList.react('▶');
			} catch (e) {
				console.error(e);
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
							embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });
						}
						break;
					}

					// Stop
					case '⏹': {
						collector.stop();
						reaction.message.reactions.removeAll();
						embedList.edit({ content: '**«Collection Stopped»**', embeds: [embeds[currentPage]] });
						break;
					}

					// Forwards
					case '▶': {
						await reaction.users.remove(message.author.id);
						if (currentPage < embeds.length - 1) {
							currentPage++;
							embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });
						}
						break;
					}
				}
			});
		}
	},
};
