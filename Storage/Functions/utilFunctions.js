const { twit_consumer, twit_consumer_secret, twit_access_token, twit_access_token_secret } = require('../../Storage/Config/Config.json');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const deJunk = require('dejunk.js');
const Twit = require('twit');
const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

module.exports = (bot) => {
	//'Sleep'
	bot.sleep = function (ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	};

	//BottomText
	bot.isBottomText = (message) => {
		if (deJunk.isJunk(message.content) && !message.mentions.members.size && !message.mentions.channels.size && !message.mentions.roles.size)
			return true;
		else return false;
	};

	//Get Duration
	bot.getDuration = (startDate, endDate) => {
		let parts = [];
		const period = moment(endDate).diff(startDate);
		const duration = moment.duration(period);
		if (!duration || duration.toISOString() === 'P0D') return;
		if (duration.years() >= 1) {
			const years = Math.floor(duration.years());
			parts.push(years + ' ' + (years > 1 ? 'years' : 'year'));
		}
		if (duration.months() >= 1) {
			const months = Math.floor(duration.months());
			parts.push(months + ' ' + (months > 1 ? 'months' : 'month'));
		}
		if (duration.days() >= 1) {
			const days = Math.floor(duration.days());
			parts.push(days + ' ' + (days > 1 ? 'days' : 'day'));
		}
		if (duration.hours() >= 1) {
			const hours = Math.floor(duration.hours());
			parts.push(hours + ' ' + (hours > 1 ? 'hours' : 'hour'));
		}
		if (duration.minutes() >= 1) {
			const minutes = Math.floor(duration.minutes());
			parts.push(minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute'));
		}
		if (duration.seconds() >= 1) {
			const seconds = Math.floor(duration.seconds());
			parts.push(seconds + ' ' + (seconds > 1 ? 'seconds' : 'second'));
		}
		return parts;
	};

	// Timestamp
	bot.Timestamp = (date) => {
		return moment(date).format('MMMM Do YYYY, h:mm A');
	};

	bot.shortTimestamp = (date) => {
		return moment(date).format('MMMM Do YYYY');
	};

	bot.relativeTimestamp = (date) => {
		return `<t:${Math.floor(date / 1000)}:R>`;
	};

	// Is Hex
	bot.isHex = (h) => {
		if (h.startsWith('#')) h = h.slice(1);
		const a = parseInt(h, 16);
		return a.toString(16) === h.toLowerCase();
	};

	// Date Difference
	bot.dateDiff = async (date) => {
		const difference = Math.abs(new Date() - date);
		return difference;
	};

	// To Thousands
	bot.toThousands = (x) => {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	//MinMax Number
	bot.MinMax = (num, min, max) => {
		const MIN = min || 1;
		const MAX = max || 10;
		const parsed = parseInt(num);
		return Math.min(Math.max(parsed, MIN), MAX);
	};

	//TitleCase
	bot.titleCase = (string) => {
		return string[0].toUpperCase() + string.slice(1).toLowerCase();
	};

	//Trim
	bot.trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

	//IsCommandOrAlias
	bot.isCmdorAlias = (message) => {
		// Setup Conditionals
		const cmd = message.content.split(/ +/).shift().toLowerCase().substring(1);
		// Command Checks
		let command = bot.commands.get(cmd);
		if (!command) command = bot.commands.get(bot.aliases.get(cmd));
		if (command) {
			return true;
		} else {
			return false;
		}
	};

	//Generate Unique ID
	bot.genUniqueId = () => {
		let Gen4 = () => {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		};
		return `${Gen4()}${Gen4()}-${Gen4()}-${Gen4()}-${Gen4()}-${Gen4()}${Gen4()}`;
	};

	//Generate One Line Embed
	bot.replyEmbed = (data) => {
		const embed = new MessageEmbed();
		if (data?.color) {
			embed.setColor(data.color);
		}
		if (data?.text) {
			embed.setDescription(data.text);
		}
		if (data?.footer) {
			embed.setFooter({ text: data.footer });
		}
		return embed;
	};

	//Get Twitter Media
	bot.getTwitterMedia = async (url) => {
		const idRegex = RegExp(/status\/(\d+)/);
		const tweet = url;
		const tweetId = idRegex.exec(tweet)[0].slice(7);
		let bitrate = 0;
		let hq_video_url;

		//If no tweet, return!
		if (!tweetId[0]) return;

		return new Promise((resolve, reject) => {
			Twitter.get('statuses/show/:id', { tweet_mode: 'extended', id: tweetId }, (err, data) => {
				if (err) return reject(error);

				//If theres a video, get the highest quality one
				if (data?.extended_entities?.media[0]?.video_info) {
					for (var j = 0; j < data.extended_entities.media[0].video_info?.variants.length; j++) {
						if (data.extended_entities.media[0].video_info.variants[j]?.bitrate >= 0) {
							if (data.extended_entities.media[0].video_info.variants[j].bitrate >= bitrate) {
								bitrate = data.extended_entities.media[0].video_info.variants[j].bitrate;
								hq_video_url = data.extended_entities.media[0].video_info.variants[j].url;
								console.log(bitrate);
								console.log(hq_video_url);
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
				resolve(tweetData);
			});
		});
	};
};
