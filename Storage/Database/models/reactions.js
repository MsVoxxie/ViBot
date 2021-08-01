const mongoose = require('mongoose');
const { defaultSettings: def } = require('./reactionDefaults');

const reactionSchema = mongoose.Schema({
	guildid: {
		type: String,
		default: def.guildid,
	},
	guildname: {
		type: String,
		default: def.guildname,
	},
	reactionRoles: {
		type: Array,
		default: def.reactionRoles,
	},
});

module.exports = mongoose.model('Reaction', reactionSchema);