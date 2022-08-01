const { MessageEmbed } = require('discord.js');
const extractUrls = require('extract-urls');
const SauceNAO = require('sagiri');
const Sauce = SauceNAO('568d0178b5e81295715624f193433dbefa480846');

module.exports = {
	name: 'sauce',
	aliases: ['source', 'findimage', 'ris'],
	description: 'Find an images "Sauce" (Source)',
	example: 'sauce <url>',
	category: 'utility',
	args: false,
	cooldown: 30,
	hidden: false,
	nsfw: true,
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
			await embedList.react('◀');
			await embedList.react('⏹');
			await embedList.react('▶');
		} catch (error) {
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
						embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, embeds: [Embeds[currentPage]] });
					}
					break;
				}

				// Stop
				case '⏹': {
					collector.stop();
					reaction.message.reactions.removeAll();
					embedList.edit({ content: '**«Collection Stopped»**', embeds: [Embeds[currentPage]] });
					break;
				}

				// Forwards
				case '▶': {
					await reaction.users.remove(message.author.id);
					if (currentPage < Embeds.length - 1) {
						currentPage++;
						embedList.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, embeds: [Embeds[currentPage]] });
					}
					break;
				}
			}
		});
	},
};
