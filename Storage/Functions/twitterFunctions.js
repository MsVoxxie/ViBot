const { twit_consumer, twit_consumer_secret, twit_access_token, twit_access_token_secret } = require('../Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Twitter', 'Status');
const Twit = require('twit');
const got = require('got');

const MAX_FILE_SIZE = 8_388_119;

const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

module.exports = (bot) => {
	//Get Twitter Media
	bot.getTwitterMedia = async (url) => {
		const idRegex = RegExp(/status\/(\d+)/);
		const tweet = url;
		const tweetId = idRegex.exec(tweet)[0].slice(7);
		let hq_video_url;

		//If no tweet, return!
		if (!tweetId[0]) return;

		return new Promise((resolve, reject) => {
			Twitter.get('statuses/show/:id', { tweet_mode: 'extended', id: tweetId }, async (err, data) => {
				if (err) return reject(error);

				//If theres a video, get the highest quality one
				if (data?.extended_entities?.media[0]?.video_info) {
					const video = data.extended_entities.media.find((item) => ['video', 'animated_gif'].includes(item.type));
					const variants = video.video_info.variants
						.filter((item) => item?.bitrate !== undefined)
						.sort((a, b) => b.bitrate - a.bitrate)
						.map((item) => item.url);
					hq_video_url = await determineHighestQuality(variants);
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
						url: data?.entities?.media ? data?.entities?.media[0]?.url : null,
						media_urls: data?.extended_entities?.media
							.filter((item) => {
								return item.type === 'photo';
							})
							.map((item) => {
								return item.media_url_https;
							}),
						video_url: hq_video_url ? hq_video_url : null,
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
				resolve(tweetData);
			});
		});
		async function determineHighestQuality(urls) {
			for (const url of urls) {
				const response = await got.head(url);
				if (parseInt(response.headers['content-length']) < MAX_FILE_SIZE) {
					return await Promise.resolve(url);
				}
			}
			return await Promise.resolve(false);
		}
	};

	//Update Streams
	bot.updateStreams = async () => {
		await bot.guilds.cache.map(async (guild) => {
			const settings = await bot.getGuild(guild);
			const twitterchannel = await guild.channels.cache.get(settings.twitterchannel);

			if (!twitterchannel) return;
			if (!settings.twitterwatch.length) return;

			const stream = Twitter.stream('statuses/filter', { follow: settings.twitterwatch });
			stream.stop();
			stream.on('tweet', async (tweet) => {
				if (isReply(tweet)) return;
				await twitterchannel.send(
					`**${tweet.user.screen_name}** Posted a new Tweet!\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
				);
			});
		});
		//Function to check if a tweet is a reply
		function isReply(tweet) {
			if (
				tweet.retweeted_status ||
				tweet.in_reply_to_status_id ||
				tweet.in_reply_to_status_id_str ||
				tweet.in_reply_to_user_id ||
				tweet.in_reply_to_user_id_str ||
				tweet.in_reply_to_screen_name
			)
				return true;
		}
	};
};
