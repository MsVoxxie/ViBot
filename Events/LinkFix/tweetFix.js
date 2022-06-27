const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		// If Partial, Fetch
		if (message.partial) {
			await message.fetch();
		}

		//Checks
		if (message.author.bot) return;
		// if (!message.content.startsWith('https://twitter.com/')) return;

		//Declarations
		const RegEx = /((https?):\/\/)?(www.)?twitter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}/gi;
		const Matches = [...message.content.matchAll(RegEx)];
		const settings = await bot.getGuild(message.guild);

		//Check if Message is a Tweet
		if (!Matches.length) return;

		await message.react('🐦');

		//Create Filter
		const filter = (reaction, user) => reaction.emoji.name === '🐦' && user.id === message.author.id;
		const collector = message.createReactionCollector({ filter, time: 60 * 1000, error: ['time'] });

		//Collector Collects
		collector.on('collect', async () => {
			//Loop through Matches
			for await (const Match of Matches) {
				console.log(Match[0]);
				//Get Media
				const tweetData = await bot.getTwitterMedia(Match[0]);
				//Make the lines pretty :)
				const intData = `♥️ [${bot.toThousands(tweetData.tweet.likes)}] 🔃 [${bot.toThousands(tweetData.tweet.retweets)}]`;
				const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

				//Create Embed
				const embeds = [];
				if (!tweetData.tweet.video_url) {
					if (!tweetData.tweet.media_urls) return await message.channel.send({ content: `Original post by ${message.author}\n${Match[0]}` });
					for await (const photo of tweetData.tweet.media_urls) {
						// Create embed for images
						const embed = new MessageEmbed()
							.setAuthor({ name: `@${tweetData.user.screen_name}` })
							.setTitle(tweetData.user.name)
							.setURL(tweetData.tweet.url)
							.setThumbnail(tweetData.user.profile_image_url)
							.setImage(tweetData.tweet.video_url ? null : photo)
							.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
							.setFooter({ text: `Original post by ${message.member.displayName}` })
							.setColor(settings.guildcolor);
						embeds.push(embed);
					}
					await message.channel.send({ embeds: embeds.map((e) => e) });
				} else {
					// Create embed for videos
					const embed = new MessageEmbed()
						.setAuthor({ name: `@${tweetData.user.screen_name}` })
						.setTitle(tweetData.user.name)
						.setURL(tweetData.tweet.url)
						.setThumbnail(tweetData.user.profile_image_url)
						.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
						.setFooter({ text: `Original post by ${message.member.displayName}` })
						.setColor(settings.guildcolor);
					const attachment = new MessageAttachment(tweetData.tweet.video_url, `media.mp4`);
					await message.channel.send({ embeds: [embed], files: [attachment] });
				}
			}
			await message.delete();
		});

		//Collector Ends
		collector.on('end', async (collected, reason) => {
			if (reason === 'time') {
				await message.reactions.cache.first().users.remove(bot.user.id);
			}
		});
	},
};
