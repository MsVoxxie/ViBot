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
	receivedm: {
		type: Boolean,
		default: true,
	},
	userroles: {
		type: Array,
		default: [],
	},
});

module.exports = mongoose.model('userData', userDataSchema);
