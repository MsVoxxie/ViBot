const { twit_consumer, twit_consumer_secret, twit_access_token, twit_access_token_secret } = require('../../Storage/Config/Config.json');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const deJunk = require('dejunk.js');

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

	//ColorToHEX
	bot.ColorToHex = (color) => {
		var hexadecimal = color.toString(16);
		return hexadecimal.length == 1 ? '0' + hexadecimal : hexadecimal;
	};

	//RGBtoHEX
	bot.ConvertRGBtoHex = (red, green, blue) => {
		return '#' + bot.ColorToHex(red) + bot.ColorToHex(green) + bot.ColorToHex(blue);
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

	//Shuffle
	bot.shuffle = str => [...str].sort(()=>Math.random()-.5).join('');

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

	//Check for Media
	bot.hasMedia = async (message) => {
		let images = [];
		let videos = [];
		let tweetData;
		const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/;
		const videoRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:mp4|gif)/;
		if (message.content.startsWith('https://twitter.com/')) {
			tweetData = await bot.getTwitterMedia(message.content);
		} else {
			if (videoRegex.test(message.content)) {
				videos.push(message.content);
			} else {
				if (imageRegex.test(message.content)) {
					images.push(message.content);
				}
				if (message.attachments.size > 0 && images.length === 0) {
					images = message.attachments
						.map((a) => a.url)
						.slice(0, 4)
						.map((e) => e);
				}
				if (message.embeds.length > 0 && images.length === 0) {
					images = message.embeds
						.map((e) => e.image.url)
						.slice(0, 4)
						.map((e) => e);
				}
			}
		}
		return { images: images, videos: videos, tweetData: tweetData };
	};
};
