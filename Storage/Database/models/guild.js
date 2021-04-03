const mongoose = require('mongoose');
const { defaultSettings: defaults } = require('./dbDefaults');

const guildSchema = mongoose.Schema({
	prefix: {
		type: String,
		default: defaults.prefix,
	},
	guildColor: {
		type: String,
		default: defaults.guildColor,
	},
	guildID: Number,
	guildName: String,
});

module.exports = mongoose.model('Guild', guildSchema);