const mongoose = require('mongoose');

const botDataSchema = mongoose.Schema({
	botuptime: String,
	totalguilds: String,
	totalusers: String,
});

module.exports = mongoose.model('BotData', botDataSchema);