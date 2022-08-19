const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
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
					.setAuthor({
						name: `${message.member.nickname ? message.member.nickname : message.member.user.username}`,
						iconURL: message.member.user.displayAvatarURL({ dynamic: true }),
					})
					.setImage(res)
					.setTimestamp(Date.now());

				embeds.push(embed);
				embeds.sort();
				return embeds;
			});

			// Send pagination
			const embedList = await loading.edit({
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
			} catch (e) {
				console.error(e);
			}

			// Filter Reactions, setup Collector and try each reaction
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
