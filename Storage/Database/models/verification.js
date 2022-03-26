const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	userid: {
		type: String,
		required: true,
	},
	messageid: {
		type: String,
		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	verifiedAt: {
		type: Date,
	},
});

module.exports = mongoose.model('verification', verificationSchema);
