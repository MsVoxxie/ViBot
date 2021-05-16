const mongoose = require('mongoose');
const { defaultSettings: def } = require('./dbDefaults');

const guildSchema = mongoose.Schema({
	prefix: {
		type: String,
		default: def.prefix,
	},
	guildColor: {
		type: String,
		default: def.guildColor,
	},
	guildID: {
		type: Number,
		default: def.guildID,
	},
	guildName: {
		type: String,
		default: def.guildName,
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
	disabledModules:{
		type: Array,
		default: def.disabledModules,
	},
});

module.exports = mongoose.model('Guild', guildSchema);