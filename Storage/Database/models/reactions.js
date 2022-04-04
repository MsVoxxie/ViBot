const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	messageid: {
		type: String,
		required: true,
	},
	channelid: {
		type: String,
		required: true,
	},
	roleidentifier: {
		type: String,
		required: true,
	},
	roleid: {
		type: String,
		required: true,
	},
	reaction: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('Reaction', reactionSchema);
