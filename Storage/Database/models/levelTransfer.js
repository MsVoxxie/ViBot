mongoose = require('mongoose');

const levelTransferSchema = new mongoose.Schema({
	guildId: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	level: {
		type: Number,
		default: 0,
	},
	xp: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('levelTransfer', levelTransferSchema);
