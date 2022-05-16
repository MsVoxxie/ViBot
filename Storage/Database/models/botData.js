const mongoose = require('mongoose');

const botDataSchema = mongoose.Schema({
	botuptime: String,
	totalguilds: String,
	totalusers: String,
	totalthanks: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('BotData', botDataSchema);
