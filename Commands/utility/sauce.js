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
	cooldown: 30,
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

		// Otherwise.. check for content
		if (!(message.attachments.size > 0)) {
			const Match = message.content.match(REGEX);
			if (Match[0]) {
				URL = Match[0];
			}
		}

		//Setup Arguments / First Image
		// if (!args.length || message.attachments.size > 0) {
		// 	await message.channel.messages.fetch().then(async (messages) => {
		// 		const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
		// 		URL = lastMessage.attachments.first().url;
		// 	});
		// } else {
		// 	URL = await (message.attachments.size > 0 ? message.attachments.first().url : args.join(''));
		// }

		//Get Source
		const Results = await Sauce(URL, { results: 10 });

		//Make sure results has results
		if (!Results.length) return message.reply('Sorry, No relevant results found!');

		Results.sort(function (a, b) {
			return (a.authorName === null) - (b.authorName === null) || +(a.authorName > b.authorName) || -(a.authorName < b.authorNameb);
		});

		//Setup Embeds
		Results.forEach((Res) => {
			const embed = new MessageEmbed()
				.setThumbnail(Res.thumbnail)
				.setColor(settings.guildcolor)
				.addField('Author›', `${Res.authorName ? Res.authorName : 'Unknown'}${Res.authorUrl ? ` (${Res.authorUrl})` : ''}`, false)
				.addField('Post URL›', `[Click Here](${Res.url})`, false)
				.addField('Likelihood›', `${Res.similarity}%`, false)
				.setFooter({ text: `${message.requester ? message.requester.username : message.member.user.username}` })
				.setTimestamp();

			Embeds.push(embed);
			return Embeds;
		});

		// Send pagination
		const embedList = await message.reply({
			content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`,
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
		const filter = (interaction) => message.author.id === interaction.user.id;
		const collector = embedList.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			await interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// Backwards
				case 'BACK': {
					if (currentPage !== 0) {
						currentPage--;
						embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, embeds: [Embeds[currentPage]] });
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
						embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, embeds: [Embeds[currentPage]] });
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
	},
};
