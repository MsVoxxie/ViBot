const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
	guildid: { type: String, required: true },
	userid: { type: String, required: true },
    usernick: { type: String, required: true },
	reason: { type: String, required: true },
	warningid: { type: String, required: true },
	moderator: { type: String, required: true },
	date: { type: Date, required: true },
});

module.exports = mongoose.model('Warning', warningSchema);
