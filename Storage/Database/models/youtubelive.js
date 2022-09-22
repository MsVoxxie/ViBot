const mongoose = require('mongoose');

const youtubeLiveSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	channelid: {
		type: String,
		required: true,
	},
	channelname: {
		type: String,
		required: true,
	},
	redirect: {
		type: String,
		required: false,
	},
	lastpost: {
		type: Date,
	},
	lastmsg: {
		type: String,
	},
	live: {
		type: Boolean,
		required: true,
	},
});

module.exports = mongoose.model('youtubeLive', youtubeLiveSchema);
