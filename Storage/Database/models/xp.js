const mongoose = require('mongoose');

const xpSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	guildname: {
		type: String,
		required: true,
	},
	memberid: {
		type: String,
		required: true,
	},
	membername: {
		type: String,
		required: true,
	},
	xp: {
		type: Number,
		default: 0,
	},
	level: {
		type: Number,
		default: 1,
	}
});

module.exports = mongoose.model('Xp', xpSchema);
