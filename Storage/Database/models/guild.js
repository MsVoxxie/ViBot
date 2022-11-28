const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
	//Prefix
	prefix: {
		type: String,
		default: '?',
	},

	//Guild Settings
	guildcolor: {
		type: String,
		default: '',
	},
	guildid: {
		type: Number,
		default: '',
	},
	guildname: {
		type: String,
		default: '',
	},

	//verification Settings
	verifiedrole: {
		type: String,
		default: 'Not Set',
	},

	//Toggles
	prune: {
		type: Boolean,
		default: false,
	},
	audit: {
		type: Boolean,
		default: false,
	},
	allownsfw: {
		type: Boolean,
		default: false,
	},
	welcome: {
		type: Boolean,
		default: false,
	},
	allowinvites: {
		type: Boolean,
		default: false,
	},
	twitchmention: {
		type: Boolean,
		default: false,
	},
	kickondeny: {
		type: Boolean,
		default: false,
	},
	spamdetection: {
		type: Boolean,
		default: false,
	},
	kicknew: {
		type: Boolean,
		default: false,
	},

	//Channels
	auditchannel: {
		type: String,
		default: 'Not Set',
	},
	welcomechannel: {
		type: String,
		default: 'Not Set',
	},
	verifychannel: {
		type: String,
		default: 'Not Set',
	},
	confirmationchannel: {
		type: String,
		default: 'Not Set',
	},
	invitelimit: {
		type: Number,
		default: 10,
	},
	ruleschannel: {
		type: String,
		default: 'Not Set',
	},
	starchannel: {
		type: String,
		default: 'Not Set',
	},
	starlimit: {
		type: Number,
		default: 3,
	},
	twitterchannel: {
		type: String,
		default: 'Not Set',
	},
	twitchchannel: {
		type: String,
		default: 'Not Set',
	},
	birthdaychannel: {
		type: String,
		default: 'Not Set',
	},
	levelchannel: {
		type: String,
		default: 'Not Set',
	},

	//Arrays
	disabledModules: {
		type: Array,
		unique: true,
		default: ['legacy'],
	},
	channels: {
		type: Array,
		unique: true,
		default: [],
	},
	roles: {
		type: Array,
		unique: true,
		default: [],
	},
	nsfwblacklist: {
		type: Array,
		unique: true,
		default: [],
	},
	staffroles: {
		type: Array,
		unique: true,
		default: [],
	},
});

module.exports = mongoose.model('Guild', guildSchema);
