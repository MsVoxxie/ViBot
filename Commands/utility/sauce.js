const { MessageEmbed } = require('discord.js');
const SauceNAO = require('saucenao');
const Sauce = new SauceNAO('568d0178b5e81295715624f193433dbefa480846');

module.exports = {
	name: 'sauce',
	aliases: ['source', 'findimage', 'ris'],
	description: 'Find an images "Sauce" (Source)',
	example: 'sauce <url>',
	category: 'utility',
	args: false,
	cooldown: 0,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Define Variables
		let URL;
		let Results = [];
		const Embeds = [];
		let currentPage = 0;
		//Setup Arguments / First Image
		if (!args.length || message.attachments.size > 0) {
			await message.channel.messages.fetch().then(async (messages) => {
				const lastMessage = messages
					.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
					.filter((m) => m.attachments.size > 0)
					.first();
				URL = lastMessage.attachments.first().url;
			});
		} else {
			URL = await (message.attachments.size > 0 ? message.attachments.first().url : args.join(''));
		}

		//Get Source
		await Sauce(URL).then(
			(res) => {
				if (res.json.results[0].header['similarity'] < 50) return;
				Results = res.json.results;
			},
			(error) => {
				console.dir(error.request);
				return message.reply(`An error occurred while fetching your request.`);
			}
		);

		//Make sure results has results
		if (!Results.length) return message.reply('Sorry, No relevant results found!');

		//Setup Embeds
		Results.forEach((Res) => {
			if (!Res.data['ext_urls'][0]) return;
			const embed = new MessageEmbed()
				.setThumbnail(Res.header['thumbnail'])
				.setColor(settings.guildcolor)
				// .setDescription(`[${Res['title']}](${Res['url']})`)
				.addField('Author›', `[${Res.data['author_name'] ? Res.data['author_name'] : 'Unknown'}](${Res.data['author_url'] ? Res.data['author_url'] : ''})`, false)
				.addField('Post URL›', `[Click Here](${Res.data['ext_urls'][0]})`, false)
				.addField('Likelihood›', `${Res.header['similarity']}%`, false)
				.setFooter({ text: message.member.user.username })
				.setTimestamp();

			Embeds.push(embed);
			return Embeds;
		});

		// Send pagination
		const embedList = await message.reply({ content: `**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, embeds: [Embeds[currentPage]] });

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
