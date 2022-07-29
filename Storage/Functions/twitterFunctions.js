const { twit_api, twit_api_secret, twit_access_token, twit_access_token_secret, twit_bearer_token } = require('../Config/Config.json');
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
const Twit = require('twit');
const got = require('got');

const MAX_FILE_SIZE = 8_388_119;

const Twitter = new Twit({
	consumer_key: twit_api,
	consumer_secret: twit_api_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

const TwitterClient = new TwitterApi({
	appKey: twit_api,
	appSecret: twit_api_secret,
	accessToken: twit_access_token,
	accessSecret: twit_access_token_secret,
});

module.exports = async (bot) => {
	// New Twitter Stream
	bot.twitterStream = async () => {
		// Definitions
		const unsortedStreams = [];

		//Check if a stream is already running
		if (bot.currentTwitterStream) {
			console.log('Twitter Stream is already running, Stopping it.');
			await bot.currentTwitterStream.close();
		}

		// Get Every guilds watch list
		const guilds = bot.guilds.cache;
		for await (const g of guilds) {
			const guild = g[1];
			const settings = await bot.getGuild(guild);
			if (settings.twitterwatch.length) {
				for await (const watch of settings.twitterwatch) {
					unsortedStreams.push(watch);
				}
			}
		}

		// Remove duplicates
		const WatchList = [...new Set(unsortedStreams)];

		// Start Stream
		console.log('Starting Twitter Stream');
		const stream = await TwitterClient.v1.stream.getStream('statuses/filter.json', {
			follow: WatchList,
		});

		stream.on(ETwitterStreamEvent.Data, async (tweet) => {
			// Check guilds for tweet id_str
			const guilds = bot.guilds.cache;
			for await (const g of guilds) {
				const guild = g[1];
				const settings = await bot.getGuild(guild);
				if (settings.twitterwatch.length) {
					if (tweet.user && settings.twitterwatch.some((id) => tweet.user.id_str === id)) {
						// This is a tweet from a watched user in guild
						// console.log(`${guild.name} is watching ${tweet.user.screen_name}`);

						// Check for tweet channel
						const twitterchannel = await guild.channels.cache.get(settings.twitterchannel);
						if (!twitterchannel) continue;

						// Send the tweet
						if (!isReply(tweet)) {
							await twitterchannel.send(`**${tweet.user.screen_name}** Posted a new Tweet!\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
						}
					}
				}
			}
		});

		// Lost Connection
		stream.on(ETwitterStreamEvent.ConnectionLost, async () => {
			console.log('Twitter connection lost.');
		});

		// Couldnt Reconnect
		stream.on(ETwitterStreamEvent.ReconnectError, (number) => {
			console.log('Twitter could not reconnect. ', number);
		});

		// Connection Closed
		stream.on(ETwitterStreamEvent.ConnectionClosed, async () => {
			console.log('Twitter connection closed!');
		});

		// Connection Resumed
		stream.on(ETwitterStreamEvent.Reconnected, () => console.log('Twitter stream has connected.'));

		// Connection Error
		stream.on(ETwitterStreamEvent.ConnectionError, async (err) => {
			console.log('Twitter connection error!', err);
		});

		// Stream Connected
		await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
		bot.currentTwitterStream = stream;
	};

	// Get Twitter Media
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

				// console.log(JSON.stringify(data, null, 2));

				//Define our own data object
				const tweetData = {
					user: {
						name: data.user.name,
						screen_name: data.user.screen_name,
						profile_image_url: data.user.profile_image_url_https.replace('_normal', ''),
						followers: data.user.followers_count,
					},
					tweet: {
						url: data.id_str ? `https://twitter.com/${data.user.screen_name}/status/${data.id_str}` : null,
						media_urls: data?.extended_entities?.media
							? data?.extended_entities?.media
									.filter((item) => {
										return item.type === 'photo';
									})
									.map((item) => {
										return item.media_url_https;
									})
							: null,
						video_url: hq_video_url ? hq_video_url : null,
						description: data.full_text
							? data.full_text
									.replace(/&lt;/g, '<')
									.replace(/&quot;/g, '"')
									.replace(/&apos;/g, "'")
									.replace(/&amp;/g, '&')
									.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
							: null,
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
};

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
