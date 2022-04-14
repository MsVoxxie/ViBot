const mongoose = require('mongoose');

const inviteSchema = mongoose.Schema({
	guildid: { type: String, required: true },
	invitecode: { type: String, required: true },
	inviter: { type: String, required: true },
	uses: { type: Number, required: true },
});

module.exports = mongoose.model('Invite', inviteSchema);