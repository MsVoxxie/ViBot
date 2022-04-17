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
	joinedat:{
		type: Date,
		default: Date.now(),
		required: true,
	},
	receivedm: {
		type: Boolean,
		default: true,
	},
	bottomcount: {
		type: Number,
		default: 0,
	},
	birthday: {
		type: String,
		default: '',
	},
	commandsused: {
		type: Number,
		default: 0,
	},
	userroles: {
		type: Array,
		default: [],
	},
});

module.exports = mongoose.model('userData', userDataSchema);
