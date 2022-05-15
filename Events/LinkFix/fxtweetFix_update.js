const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'messageUpdate',
	disabled: false,
	once: false,
	async execute(old, message, bot) {
		// If Partial, Fetch
		if (message.partial) {
			await message.fetch();
		}

		//Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://fxtwitter.com/')) return;

		//Declarations
		const settings = await bot.getGuild(message.guild);

		//Get Media
		const tweetData = await bot.getTwitterMedia(message.content);

		//Make the lines pretty :)
		const intData = `♥️ [${bot.toThousands(tweetData.tweet.likes)}] 🔃 [${bot.toThousands(tweetData.tweet.retweets)}]`;
		const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

		//Collector Collects
		const embeds = [];
		if (!tweetData.tweet.video_url) {
			for await (const photo of tweetData.tweet.media_urls) {
				// Create embed
				const embed = new MessageEmbed()
					.setAuthor({ name: `@${tweetData.user.screen_name}` })
					.setTitle(tweetData.user.name)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setImage(tweetData.tweet.video_url ? null : photo)
					.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
					.setColor(settings.guildcolor);
				embeds.push(embed);
			}
			await message.channel.send({ content: `Original post by ${message.author}`, embeds: embeds.map((e) => e) });
		} else {
			// Create embed
			const embed = new MessageEmbed()
				.setAuthor({ name: `@${tweetData.user.screen_name}` })
				.setTitle(tweetData.user.name)
				.setURL(tweetData.tweet.url)
				.setThumbnail(tweetData.user.profile_image_url)
				.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
				.setColor(settings.guildcolor);
			const attachment = new MessageAttachment(tweetData.tweet.video_url, `media.mp4`);
			await message.channel.send({ content: `Original post by ${message.author}`, embeds: [embed], files: [attachment] });
		}
		await message.delete();
	},
};
