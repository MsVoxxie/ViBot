const Twit = require('twit');

const {
	twit_consumer,
	twit_consumer_secret,
	twit_access_token,
	twit_access_token_secret,
} = require('../Config/Config.json');

const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

module.exports = (bot) => {
	bot.updateStreams = async () => {
		console.log('Updating All Twitter Streams.');

		bot.guilds.cache.map(async (guild) => {
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
