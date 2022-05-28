const mongoose = require('mongoose');

const botDataSchema = mongoose.Schema({
	botuptime: String,
	totalguilds: String,
	totalusers: String,
	totalthanks: {
		type: Number,
		default: 0,
	},
	restartdata: {
		type: Object,
		default: {},
	},
});

module.exports = mongoose.model('BotData', botDataSchema);
