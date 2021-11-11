const mongoose = require('mongoose');
const { defaultSettings: def } = require('./twitchwatchDefaults');

const twitchwatchSchema = new mongoose.Schema({
	guildid: {
		type: String,
		default: def.guildid,
	},
	guildname: {
		type: String,
		default: def.guildname,
	},
	twitchchannels: {
		type: Array,
		default: def.twitchchannels,
	},
});

module.exports = mongoose.model('TwitchWatch', twitchwatchSchema);
