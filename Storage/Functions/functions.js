const mongoose = require('mongoose');
const { Guild } = require('../Database/models');

module.exports = bot => {
	// Get Guild Settings
	bot.getGuild = async (guild) => {
		const data = await Guild.findOne({ guildID: guild.id });
		if(data) return data;
		else return bot.defaults.dbDefaults;
	};
	// Update Guild Settings
	bot.updateGuild = async (guild, settings) => {
		let data = await bot.getGuild(guild);
		if(typeof data !== 'object') data = {};
		for (const key in settings) {
			if(data[key] !== settings[key]) data[key] = settings[key];
			else return;
		}
		console.log(`Guild '${data.guildName}' updated its settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	};
	// Create Guild from MODEL
	bot.createGuild = async (settings) => {
		const defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, bot.defaults.dbDefaults);
		const merged = Object.assign(defaults, settings);

		const newGuild = await new Guild(merged);
		return newGuild.save().then(console.log(`Created new Guild from MODEL: ${merged.guildName}`));
	};
};