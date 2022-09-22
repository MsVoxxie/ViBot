const mongoose = require('mongoose');

const twitchLiveSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	twitchid: {
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

module.exports = mongoose.model('twitchlive', twitchLiveSchema);
