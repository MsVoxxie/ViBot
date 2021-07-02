const mongoose = require('mongoose');
const { Guild, GuildModeration, Reaction } = require('../Database/models');

module.exports = (bot) => {
	// Get Guild Settings
	bot.getGuild = async (guild) => {
		const data = await Guild.findOne({ guildid: guild.id });
		if (data) return data;
		else return bot.guildDefaults.defaultSettings;
	};

	// Update Guild Settings
	bot.updateGuild = async (guild, settings) => {
		let data = await bot.getGuild(guild);
		if (typeof data !== 'object') data = {};
		for (const key in settings) {
			if (data[key] !== settings[key]) data[key] = settings[key];
			else return;
		}
		console.log(`Guild '${data.guildname}' updated its settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	};

	// Create Guild from MODEL
	bot.createGuild = async (settings) => {
		const defaults = Object.assign(
			{ _id: mongoose.Types.ObjectId() },
			bot.guildDefaults.defaultSettings
		);
		const merged = Object.assign(defaults, settings);
		const newGuild = await new Guild(merged);
		const check = await Guild.findOne({ guildid: merged.guildid });
		if (check) {
			return;
		} else {
			return newGuild.save().then(console.log(`Created new Guild from MODEL: ${merged.guildname}`));
		}
	};

	// Create Guild Moderation
	bot.createGuildModeration = async (settings) => {
		const defaults = Object.assign(
			{ _id: mongoose.Types.ObjectId() },
			bot.guildModerationDefaults.defaultSettings
		);
		merged = Object.assign(defaults, settings);
		const newGuild = await new GuildModeration(merged);
		const check = await GuildModeration.findOne({ guildid: merged.guildid });
		if (check) {
			return;
		} else {
			return newGuild.save().then(
				console.log(`Created new GuildModeration for ${merged.guildname}`)
			);
		}
	};

	// Reaction Roles Create
	bot.createReactions = async (settings) => {
		const defaults = Object.assign(
			{ _id: mongoose.Types.ObjectId() },
			bot.reactionDefaults.defaultSettings
		);
		const merged = Object.assign(defaults, settings);
		const newReaction = await new Reaction(merged);
		const check = await Reaction.findOne({ guildid: merged.guildid });
		if (check) {
			return;
		} else {
			return newReaction
				.save()
				.then(console.log(`Created new Reaction Model for \`${merged.guildname}\``));
		}
	};

	// Get guild Reaction Roles
	bot.getReactions = async (guild) => {
		const data = await Reaction.findOne({ guildid: guild.id });
		if (data) return data;
		else return bot.reactionDefaults.defaultSettings;
	};

	// Add Reaction to Guild
	bot.addReaction = async (guild, settings) => {
		const data = await Reaction.findOne({ guildid: guild.id });
		const reactionRoles = await data.reactionRoles;
		if (typeof settings !== 'object')
			return console.log('User did not provide an object, Returning.');

		reactionRoles.push(settings);
		data.save();
	};

	// Remove Reaction to Guild
	bot.removeReaction = async (guild, settings) => {
		const data = await Reaction.findOne({ guildid: guild.id });
		const reactionRoles = await data.reactionRoles;
		if (typeof settings !== 'object')
			return console.log('User did not provide an object, Returning.');

		reactionRoles.pull(settings);
		data.save();
	};

	// Add Module to List
	bot.disableModule = async (guild, module) => {
		const data = await Guild.findOne({ guildid: guild.id });
		const Modules = await data.disabledModules;
		const cats = await bot.commands.map((c) => c.category);

		// Check for valid
		if (!cats.includes(module)) return;
		if (Modules.includes(module)) return;

		// Save
		Modules.push(module);
		data.save();
	};

	// Remove Module from List
	bot.enableModule = async (guild, module) => {
		const data = await Guild.findOne({ guildid: guild.id });
		const Modules = await data.disabledModules;
		const cats = await bot.commands.map((c) => c.category);

		// Check for valid
		if (!cats.includes(module)) return;
		if (!Modules.includes(module)) return;

		// Save
		Modules.pull(module);
		data.save();
	};
};
