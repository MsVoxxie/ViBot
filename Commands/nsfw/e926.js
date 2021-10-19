const Booru = require('booru');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'e926',
	aliases: ['e9'],
	description: 'Search e926 for Saucy images.',
	example: 'e926 tags, go, here, with, commas',
	category: 'nsfw',
	args: true,
	nsfw: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const SiteToSearch = 'e926';
		const Tags = args.join(' ').split(', ');
		const embeds = [];
		let currentPage = 0;
		let SearchResults = [];

		// Check Blacklist against Searched Tags
		if (bot.GlobalNSFWBlacklist.some((tag) => Tags.includes(tag)))
			return message.reply(`One or more of the tags you have searched are on the Global blacklist.`);
		if (settings.nsfwblacklist > 0) {
			if (settings.nsfwblacklist.some((tag) => Tags.includes(tag)))
				return message.reply(`One or more of the tags you have searched are on this guilds blacklist.`);
		}

		// Let the user know i'm working...
		const loading = await message.reply(`${Vimotes['A_LOADING']}Gathering image results...`);

		//Search
		await Booru.search(SiteToSearch, Tags, { limit: 10, random: true }).then(async (results) => {
			if (results.length === 0) {
				return message.reply('No results found.').then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
				});
			} else {
				SearchResults = results;
			}
		});

		//Setup Pagination
		SearchResults.forEach((res) => {
			// Check Blacklist against Searched Tags
			if (bot.GlobalNSFWBlacklist.some((tag) => res.tags.includes(tag))) return;
			if (settings.nsfwblacklist > 0) {
				if (settings.nsfwblacklist.some((tag) => res.tags.includes(tag))) return;
			}

			const embed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setDescription(`**Score** ${res.score} | **Resolution** ${res.data.file['width']} x ${res.data.file['height']} | **[Link](${res.postView})**`)
				.setImage(res.fileUrl);

			embeds.push(embed);
			embeds.sort();
			return embeds;
		});

		// Send pagination
		const embedList = await loading.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });

		// Apply Reactions
		try {
			await embedList.react('❌');
			await embedList.react('◀');
			await embedList.react('▶');
			await embedList.react('✅');
		} catch (e) {
			console.error(e);
		}

		// Filter Reactions, setup Collector and try each reaction
		const filter = (reaction, user) => ['◀', '✅', '▶', '❌'].includes(reaction.emoji.name) && message.author.id === user.id;
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
				case '✅': {
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
				// Delete
				case '❌': {
					collector.stop();
					reaction.message.delete();
					break;
				}
			}
		});
	},
};
