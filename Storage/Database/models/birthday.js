const mongoose = require('mongoose');
const { defaultSettings: def } = require('./birthdayDefaults');

const birthdaySchema = new mongoose.Schema({
	guildid: {
		type: String,
		default: def.guildid,
	},
	guildname: {
		type: String,
		default: def.guildname,
	},
	birthdays: {
		type: Array,
		default: def.birthdays,
	},
});

module.exports = mongoose.model('Birthdays', birthdaySchema);
