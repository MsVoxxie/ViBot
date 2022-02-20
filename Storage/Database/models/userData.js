const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now,
		expires: '60',
	},
	guildid: {
		type: String,
		required: true,
	},
	userid: {
		type: String,
		required: true,
	},
	userroles: {
		type: Array,
		default: [],
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60,
	},
});

userDataSchema.index({ lastModified: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model('userData', userDataSchema);
