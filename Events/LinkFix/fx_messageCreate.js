const { twit_consumer, twit_consumer_secret, twit_access_token, twit_access_token_secret } = require('../../Storage/Config/Config.json');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Twit = require('twit');
const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

// SELF NOTE
// CLEAN THIS UP LATER

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
		if (!message.content.startsWith('https://twitter.com/')) return;

		//Declarations
		const settings = await bot.getGuild(message.guild);
		const idRegex = RegExp(/status\/(\d+)/);
		const tweet = message.content;
		const tweetId = idRegex.exec(tweet)[0].slice(7);
		var bitrate = 0;
		var hq_video_url;

		//If no tweet, return!
		if (!tweetId[0]) return;

		Twitter.get('statuses/show/:id', { tweet_mode: 'extended', id: tweetId }, async (err, data, response) => {
			if (err) return;

			//If theres a video, get the highest quality one
			if (data?.extended_entities?.media[0]?.video_info) {
				for (var j = 0; j < data.extended_entities.media[0].video_info.variants.length; j++) {
					if (data.extended_entities.media[0].video_info.variants[j].bitrate) {
						if (data.extended_entities.media[0].video_info.variants[j].bitrate > bitrate) {
							bitrate = data.extended_entities.media[0].video_info.variants[j].bitrate;
							hq_video_url = data.extended_entities.media[0].video_info.variants[j].url;
						}
					}
				}
			}

			//Define our own data object
			const tweetData = {
				user: {
					name: data.user.name,
					screen_name: data.user.screen_name,
					profile_image_url: data.user.profile_image_url_https.replace('_normal', ''),
					followers: data.user.followers_count,
				},
				tweet: {
					url: data.entities.media[0].url,
					media_url: data.entities.media[0].media_url_https,
					video_url: hq_video_url ? hq_video_url.replace('?tag=12', '') : null,
					description: data.full_text
						.replace(/&lt;/g, '<')
						.replace(/&quot;/g, '"')
						.replace(/&apos;/g, "'")
						.replace(/&amp;/g, '&')
						.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
					likes: data.favorite_count,
					retweets: data.retweet_count,
				},
			};

			await message.react('🐦');

			//Create Filter
			const filter = (reaction, user) => reaction.emoji.name === '🐦' && user.id === message.author.id;
			const collector = message.createReactionCollector({ filter, time: 60 * 1000, error: ['time'] });

			//Collector Collects
			collector.on('collect', async (reaction, user) => {
				//Create embed
				const embed = new MessageEmbed()
					.setTitle(`@${tweetData.user.screen_name}`)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setImage(tweetData.tweet.video_url ? null : tweetData.tweet.media_url)
					.setDescription(
						`${tweetData.tweet.description}\n─────────────\n♥ [${tweetData.tweet.likes}] ⤴ [${tweetData.tweet.retweets}]\n─────────────`
					)
					.setColor(settings.guildcolor);

				//Send the embed
				if (tweetData.tweet.video_url) {
					const attachment = new MessageAttachment(tweetData.tweet.video_url, `media.mp4`);
					await message.channel.send({ content: `Original post by ${message.author}`, embeds: [embed], files: [attachment] });
				} else {
					await message.channel.send({ content: `Original post by ${message.author}`, embeds: [embed] });
				}
				await message.delete();
			});

			//Collector Ends
			collector.on('end', async (collected, reason) => {
				if (reason === 'time') {
					await message.reactions.cache.first().users.remove(bot.user.id);
				}
			});
		});
	},
};
