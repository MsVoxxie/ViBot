const moment = require('moment');
const deJunk = require('dejunk.js');

module.exports = (bot) => {
	//BottomText
	bot.isBottomText = (message) => {
		if (deJunk.isJunk(message.content) && !message.mentions.members.size && !message.mentions.channels.size && !message.mentions.roles.size) return true;
		else return false;
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
};
