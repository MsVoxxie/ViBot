const mongoose = require('mongoose');

const statisticsSchema = mongoose.Schema({
	guildid: {
		type: String,
		unique: true,
		required: true,
	},
	words: {
        type: Array,
		word: String,
		count: Number,
	},
	emojis: {
		emoji: String,
		count: Number,
	},
});

module.exports = mongoose.model('Statistics', statisticsSchema);
