const mongooose = require('mongoose');

const starboardSchema = mongooose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	authorid: {
		type: String,
		required: true,
	},
	messageid: {
		type: String,
		required: true,
	},
	starid: {
		type: String,
		required: true,
	},
	channelid: {
		type: String,
		required: true,
	},
	starcount: {
		type: Number,
		required: true,
	},
	starred: {
		type: Boolean,
		require: true,
	}
});

module.exports = mongooose.model('Starboard', starboardSchema);
