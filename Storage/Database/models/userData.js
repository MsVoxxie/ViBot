const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
		unique: true,
	},
	userid: {
		type: String,
		required: true,
		unique: true,
	},
	joinedat: {
		type: Date,
		default: Date.now(),
		required: true,
	},
	nickname: {
		type: String,
		default: '',
	},
	receivedm: {
		type: Boolean,
		default: true,
	},
	xp: {
		type: Number,
		default: 0,
	},
	xpinterval: {
		type: Number,
		default: 0,
	},
	level: {
		type: Number,
		default: 1,
	},
	totalmessages: {
		type: Number,
		default: 0,
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
	reminders: {
		type: Array,
		default: [],
	},

	// Voice Data
	lastvoice: {
		channelid: {
			type: String,
		},
		jointime: {
			type: Date,
		},
		leavetime: {
			type: Date,
		},
	},
});

module.exports = mongoose.model('userData', userDataSchema);
