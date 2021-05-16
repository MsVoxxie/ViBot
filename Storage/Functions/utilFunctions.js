const moment = require('moment');

module.exports = bot => {

	// Timestamp
	bot.Timestamp = date => {
		return moment(date).format('MMMM Do YYYY, h:mm A');
	};

};