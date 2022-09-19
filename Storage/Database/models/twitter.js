const mongoose = require('mongoose');

const twitterSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
		unique: true,
	},
	twitterid: {
		type: String,
		required: true,
		unique: true,
	},
	threadid: {
		type: String,
		required: false,
		unique: true,
	},
	redirect: {
		type: String,
		required: false,
	},
	type: {
		type: Number,
		required: true,
		default: 0,
	},
});

module.exports = mongoose.model('Twitter', twitterSchema);
