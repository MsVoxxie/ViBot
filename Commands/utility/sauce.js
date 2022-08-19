const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { SauceNaoKey } = require('../../Storage/Config/Config.json');
const SauceNAO = require('sagiri');
const Sauce = SauceNAO(SauceNaoKey.toString());

module.exports = {
	name: 'sauce',
	aliases: ['source', 'findimage', 'ris'],
	description: 'Find an images "Sauce" (Source)\nCOULD RETURN NSFW RESULTS',
	example: 'sauce <url>',
	category: 'utility',
	args: false,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Define Variables
		let URL;
		const Embeds = [];
		let currentPage = 0;
		const REGEX = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|png))/i;

		//Check for attachments
		if (message.attachments.size > 0) {
			URL = message.attachments.first().url;
		}

		// Check urls in the message
		if (!(message.attachments.size > 0)) {
			const Match = message.content.match(REGEX);
			if (Match) {
				URL = Match[0];
			}
		}

		// // ...Check for the last few messages having attachments
		// if (!args.length && !(message.attachments.size > 0)) {
		// 	await message.channel.messages.fetch().then((messages) => {
		// 		const filteredMessages = messages.filter((m) => m.attachments.size > 0);
		// 		URL = filteredMessages?.first()?.attachments?.first()?.url;
		// 	});
		// }

		// Still no results, Error out.
		if (!URL) return message.channel.send('Please provide an image to search for.\nIf the image was already posted, react to it with 🍝.');

		//Get Source
		try {
			const Results = await Sauce(URL, { results: 10 });

			//Make sure results has results
			if (!Results.length) return message.reply('Sorry, No relevant results found!');

			//Setup Embeds
			Results.forEach((Res) => {
				const embed = new MessageEmbed()
					.setAuthor({ name: `${Res.authorName ? Res.authorName : 'Unknown'}`, url: Res.authorUrl ? Res.authorUrl : Res.url })
					.setDescription(`**Site»** ${Res.site}\n**Post URL»** [Click Here](${Res.url})\n**Similarity»** ${Res.similarity}%`)
					.setThumbnail(`${Res.thumbnail}`)
					.setFooter({ text: `${message.requester ? message.requester.username : message.member.user.username}` })
					.setColor(settings.guildcolor)
					.setTimestamp();

				Embeds.push(embed);
				return Embeds;
			});

			// Send pagination
			const embedList = await message.reply({
				content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}»**`,
				embeds: [Embeds[currentPage]],
			});

			// Apply Reactions
			try {
				const Buttons = new MessageActionRow().addComponents(
					new MessageButton().setLabel('Back').setStyle('SUCCESS').setCustomId('BACK'),
					new MessageButton().setLabel('Stop').setStyle('DANGER').setCustomId('STOP'),
					new MessageButton().setLabel('Next').setStyle('SUCCESS').setCustomId('NEXT')
				);
				await embedList.edit({ components: [Buttons] });
			} catch (error) {
				console.error(error);
			}

			// Filter Reactions, setup Collector and try each reaction
			const filter = (interaction) => (message.requester ? message.requester.id : message.member.user.id === interaction.user.id);
			const collector = embedList.createMessageComponentCollector({ filter, time: 300 * 1000 });
			collector.on('collect', async (interaction) => {
				await interaction.deferUpdate();
				// Switch Case
				switch (interaction.customId) {
					// Backwards
					case 'BACK': {
						if (currentPage !== 0) {
							currentPage--;
							embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}»**`, embeds: [Embeds[currentPage]] });
						}
						break;
					}

					// Stop
					case 'STOP': {
						collector.stop();
						embedList.edit({ content: '**«Collection Stopped»**', embeds: [Embeds[currentPage]], components: [] });
						break;
					}

					// Forwards
					case 'NEXT': {
						if (currentPage < Embeds.length - 1) {
							currentPage++;
							embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}»**`, embeds: [Embeds[currentPage]] });
						}
						break;
					}
				}
			});

			//Tell users the collection ended when it has.
			collector.on('end', async () => {
				const msg = await message.channel.messages.fetch(embedList.id);
				await msg.edit({ content: '**«Collection Stopped»**', components: [] });
			});
		} catch (error) {
			console.error(error);
			return message.reply('Sorry, An error occured while searching. Please try again later.');
		}
	},
};
