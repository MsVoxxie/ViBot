const { MessageEmbed } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
	name: 'reversesearch',
	aliases: ['ris', 'rs'],
	description: 'Reverse Search for an Image',
	example: 'ris [ur]',
	category: 'utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Define Variables
		let URL;
		let Results;
		const Embeds = [];
		let currentPage = 0;
		//Setup Arguments / First Image
		if (!args.length) {
			await message.channel.messages.fetch().then(async (messages) => {
				const lastMessage = messages
					.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
					.filter((m) => m.attachments.size > 0)
					.first();
				URL = lastMessage.attachments.first().url;
			});
		} else {
			URL = args.join('');
		}

		//Setup Pupeteer Browser Function
		const GetResults = async (imageURL, callback) => {
			const Browser = await puppeteer.launch({ args: ['-no-sandbox'] });
			const Page = await Browser.newPage();
			await Page.goto(
				`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageURL)}`
			);

			const images = await Page.evaluate(() => {
				return Array.from(document.querySelectorAll('div div a h3'))
					.slice(2)
					.map((e) => e.parentNode)
					.map((el) => ({ url: el.href, title: el.querySelector('h3').innerHTML }));
			});
			callback(images);
			await Browser.close();
		};

		//Get Results after Search
		await GetResults(URL, async (result) => {
			Results = result;
			Results.splice(0, 1);
		});

		//Setup Embeds
		Results.forEach((Res) => {
			const embed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setFooter(message.member.user.username)
				.setTimestamp()
				.setDescription(`[${Res['title']}](${Res['url']})`)
				.setImage(URL);

			Embeds.push(embed);
			return Embeds;
		});

		// Send pagination
		const embedList = await message.lineReply(
			`**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`,
			{ embed: Embeds[currentPage] }
		);

		// Apply Reactions
		try {
			await embedList.react('◀');
			await embedList.react('⏹');
			await embedList.react('▶');
		} catch (error) {
			console.error(error);
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
						embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, {
							embed: Embeds[currentPage],
						});
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
					if (currentPage < Embeds.length - 1) {
						currentPage++;
						embedList.edit(`**«Current Page» ‹${currentPage + 1} / ${Embeds.length}›**`, {
							embed: Embeds[currentPage],
						});
					}
					break;
				}
			}
		});
	},
};
