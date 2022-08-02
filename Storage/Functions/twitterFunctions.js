const { twit_api, twit_api_secret, twit_access_token, twit_access_token_secret } = require('../Config/Config.json');
const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Twitter } = require('../Database/models/');
const got = require('got');
const MAX_FILE_SIZE = 8_388_119;

const TwitterClient = new TwitterApi({
	appKey: twit_api,
	appSecret: twit_api_secret,
	accessToken: twit_access_token,
	accessSecret: twit_access_token_secret,
});

module.exports = async (bot) => {
	//Tweet Data v2
	bot.getTweet = async (URL) => {
		return new Promise(async (resolve, reject) => {
			//Declarations
			const idRegex = RegExp(/status\/(\d+)/);
			const tweetId = idRegex.exec(URL)[0].slice(7);
			let hq_video_url;

			//Get Tweet
			try {
				const Tweet = await TwitterClient.v1.singleTweet(tweetId, { tweet_mode: 'extended' });

				//If theres a video, get the highest quality one
				if (Tweet?.extended_entities?.media[0]?.video_info) {
					const video = Tweet.extended_entities.media.find((item) => ['video', 'animated_gif'].includes(item.type));
					const variants = video.video_info.variants.filter((item) => item?.bitrate !== undefined).sort((a, b) => b.bitrate - a.bitrate).map((item) => item.url);
					hq_video_url = await determineHighestQuality(variants);
				}

				//Define the tweet data
				const tweetData = {
					user: {
						name: Tweet.user.name,
						screen_name: Tweet.user.screen_name,
						profile_image_url: Tweet.user.profile_image_url_https.replace('_normal', ''),
						followers: Tweet.user.followers_count,
					},
					tweet: {
						url: Tweet.id_str ? `https://twitter.com/${Tweet.user.screen_name}/status/${Tweet.id_str}` : null,
						media_urls: Tweet?.extended_entities?.media ? Tweet?.extended_entities?.media .filter((item) => { return item.type === 'photo'; }) .map((item) => { return item.media_url_https; }) : null,
						video_url: hq_video_url ? hq_video_url : null,
						description: Tweet.full_text ? Tweet.full_text .replace(/&lt;/g, '<') .replace(/&quot;/g, '"') .replace(/&apos;/g, "'") .replace(/&amp;/g, '&') .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') : null,
						likes: Tweet.favorite_count,
						retweets: Tweet.retweet_count,
					},
				};

				//Resolve the promise
				resolve(tweetData);
			} catch (error) {
				//Reject the promise
				reject(error);
			}
		});
	};

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
			//Only fire if its an original tweet
			if (isReply(tweet)) return;

			// Check guilds for tweet id_str
			const guilds = bot.guilds.cache;
			for await (const g of guilds) {
				const guild = g[1];
				const settings = await bot.getGuild(guild);
				const guildWatchList = await Twitter.find({ guildid: guild.id, twitterid: tweet.user.id_str }).lean();
				if (guildWatchList.length) {
					if (tweet.user) {
						const twitterchannel = await guild.channels.cache.get(settings.twitterchannel);
						if (!twitterchannel) continue;

						switch (guildWatchList[0].type) {
							case 0: // All Tweets
								const tweetEmbed = await bot.embedTweet(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, settings);
								tweetEmbed.content = `**${tweet.user.screen_name}** Posted a new Tweet!`;
								await twitterchannel.send(tweetEmbed);
								break;
							case 1: // Text Only
								if (tweet.text.length > 0 && !tweet.extended_entities) {
									const tweetEmbed = await bot.embedTweet(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, settings);
									tweetEmbed.content = `**${tweet.user.screen_name}** Posted a new Tweet!`;
									await twitterchannel.send(tweetEmbed);
								}
								break;
							case 2: // Media Only
								if (tweet.extended_entities) {
									const tweetEmbed = await bot.embedTweet(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, settings);
									tweetEmbed.content = `**${tweet.user.screen_name}** Posted a new Tweet!`;
									await twitterchannel.send(tweetEmbed);
								}
								break;
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
		stream.on(ETwitterStreamEvent.ReconnectError, async (number) => {
			console.log('Twitter could not reconnect.\nAttempting to Restart Stream.', number);
			await bot.twitterStream();
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

	// Return Tweet for tweet watch
	bot.embedTweet = async (tweet, settings) => {
		return new Promise(async (resolve, reject) => {
			//Define Get Tweet
			const tweetData = await bot.getTweet(tweet);

			//Make the lines pretty :) -- This is pointless as the tweet is sent imediately, but it's here for future use
			// const intData = `♥️ [${bot.toThousands(tweetData.tweet.likes)}] 🔃 [${bot.toThousands(tweetData.tweet.retweets)}]`;
			// const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

			//Create Embed
			const embeds = [];

			//Text Only
			if (tweetData.tweet.description && !tweetData.tweet.media_urls && !tweetData.tweet.video_url) {
				const embed = new MessageEmbed()
					.setAuthor({ name: `@${tweetData.user.screen_name}`, url: `https://twitter.com/${tweetData.user.screen_name}` })
					.setTitle(tweetData.user.name)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setDescription(`${tweetData.tweet.description}`) // Do this later \n${wrapLines}\n${intData}\n${wrapLines}`)
					.setColor(settings.guildcolor);
				embeds.push(embed);
				resolve({ embeds: embeds.map((e) => e) });
			}

			//Media Only
			if (tweetData.tweet.media_urls && !tweetData.tweet.video_url) {
				for await (const photo of tweetData.tweet.media_urls) {
					const embed = new MessageEmbed()
						.setAuthor({ name: `@${tweetData.user.screen_name}` })
						.setTitle(tweetData.user.name)
						.setURL(tweetData.tweet.url)
						.setThumbnail(tweetData.user.profile_image_url)
						.setImage(tweetData.tweet.video_url ? null : photo)
						.setDescription(`${tweetData.tweet.description}`) // Do this later \n${wrapLines}\n${intData}\n${wrapLines}`)
						.setColor(settings.guildcolor);
					embeds.push(embed);
				}
				resolve({ embeds: embeds.map((e) => e) });
			}

			//Video Only
			if (tweetData.tweet.video_url) {
				const embed = new MessageEmbed()
					.setAuthor({ name: `@${tweetData.user.screen_name}` })
					.setTitle(tweetData.user.name)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setDescription(`${tweetData.tweet.description}`) // Do this later \n${wrapLines}\n${intData}\n${wrapLines}`)
					.setColor(settings.guildcolor);
				const attachment = new MessageAttachment(tweetData.tweet.video_url, `media.mp4`);
				resolve({ embeds: [embed], files: [attachment] });
			}
		});
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
		tweet.in_reply_to_screen_name ||
		tweet.delete
	)
		return true;
}

//Get the highest quality video
async function determineHighestQuality(urls) {
	for (const url of urls) {
		const response = await got.head(url);
		if (parseInt(response.headers['content-length']) < MAX_FILE_SIZE) {
			return await Promise.resolve(url);
		}
	}
	return await Promise.resolve(false);
}
