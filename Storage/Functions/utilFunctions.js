const moment = require('moment');

module.exports = bot => {

	// Timestamp
	bot.Timestamp = date => {
		return moment(date).format('MMMM Do YYYY, h:mm A');
	};

	// Is Hex
	bot.isHex = h => {
		if(h.startsWith('#')) h = h.slice(1);
		const a = parseInt(h, 16);
		return (a.toString(16) === h.toLowerCase());
	};

};