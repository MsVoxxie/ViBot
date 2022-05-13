const mongoose = require('mongoose');

const levelrolesSchema = mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	level: {
		type: Number,
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
});

module.exports = mongoose.model('Levelroles', levelrolesSchema);
