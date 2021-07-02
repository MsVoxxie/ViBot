const mongoose = require('mongoose');

const guildModerationSchema = mongoose.Schema({
	guildname: {
		type: String,
		required: true,
	},
	guildid: {
		type: String,
		required: true,
	},
	users: {
		type: Array,
	},
});

module.exports = mongoose.model('GuildModeration', guildModerationSchema);
