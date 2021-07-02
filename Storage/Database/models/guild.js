const mongoose = require('mongoose');
const { defaultSettings: def } = require('./guildDefaults');

const guildSchema = mongoose.Schema({
	prefix: {
		type: String,
		default: def.prefix,
	},
	guildcolor: {
		type: String,
		default: def.guildgolor,
	},
	guildid: {
		type: Number,
		default: def.guildid,
	},
	guildname: {
		type: String,
		default: def.guildname,
	},
	prune: {
		type: Boolean,
		default: def.prune,
	},
	audit: {
		type: Boolean,
		default: def.audit,
	},
	auditchannel: {
		type: String,
		default: def.auditchannel,
	},
	welcome: {
		type: Boolean,
		default: def.welcome,
	},
	welcomechannel: {
		type: String,
		default: def.welcomechannel,
	},
	ruleschannel: {
		type: String,
		default: def.ruleschannel,
	},
	starchannel: {
		type: String,
		default: def.starchannel,
	},
	disabledModules: {
		type: Array,
		default: def.disabledModules,
	},
	channels: {
		type: Array,
		default: def.channels,
	},
});

module.exports = mongoose.model('Guild', guildSchema);
