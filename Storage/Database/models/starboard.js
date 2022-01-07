const mongooose = require('mongoose');

const starboardSchema = mongooose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	guildname: {
		type: String,
		required: true,
	},
	messageid: {
		type: String,
		required: true,
	},
	stars: {
		type: Number,
		required: true,
	},
});

module.exports = mongooose.model('Starboard', starboardSchema);
