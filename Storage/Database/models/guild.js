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
	prune: {
		type: Boolean,
		default: defaults.prune,
	},
	audit: {
		type: Boolean,
		default: defaults.audit,
	},
	auditchannel: {
		type: String,
		default: defaults.auditchannel,
	},
});

module.exports = mongoose.model('Guild', guildSchema);