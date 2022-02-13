const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	userid: {
		type: String,
		required: true,
	},
	userroles: {
		type: Array,
		default: [],
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60,
	},
});

module.exports = mongoose.model('userData', userDataSchema);
