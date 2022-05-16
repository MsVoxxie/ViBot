const mongoose = require('mongoose');
const moment = require('moment');
require('moment-duration-format');
const { MessageEmbed } = require('discord.js');
const { BotData, Guild, Levelroles, TwitchWatch, userData } = require('../Database/models');

module.exports = (bot) => {
	// Get Guild Settings
	bot.getGuild = async (guild) => {
		if (!guild) throw new Error('No Guild Provided!');
		const data = await Guild.findOne({ guildid: guild.id });
		if (data) return data;
		else return bot.guildDefaults.defaultSettings;
	};

	// Update Guild Settings
	bot.updateGuild = async (guild, settings) => {
		if (!guild) throw new Error('No Guild Provided!');
		let data = await bot.getGuild(guild);
		if (typeof data !== 'object') data = {};
		for (const key in settings) {
			if (data[key] !== settings[key]) data[key] = settings[key];
			else return;
		}
		// console.log(`Guild '${data.guildname}' updated its settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	};

	// Create Guild from MODEL
	bot.createGuild = async (settings) => {
		const defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, bot.guildDefaults.defaultSettings);
		const merged = Object.assign(defaults, settings);
		const newGuild = await new Guild(merged);
		const check = await Guild.findOne({ guildid: merged.guildid });
		if (check) {
			return;
		} else {
			return newGuild.save().then(console.log(`Created new Guild from MODEL: ${merged.guildname}`));
		}
	};

	// Add Module to List
	bot.disableModule = async (guild, module) => {
		if (!guild) throw new Error('No Guild Provided!');
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
		if (!guild) throw new Error('No Guild Provided!');
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

	// Create Twitch Database
	bot.createTwitchWatch = async (settings) => {
		const defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, bot.twitchwatchDefaults.defaultSettings);
		const merged = Object.assign(defaults, settings);
		const newTwitchWatch = await new TwitchWatch(merged);
		const check = await TwitchWatch.findOne({ guildid: merged.guildid });
		if (check) {
			return;
		} else {
			return newTwitchWatch.save().then(console.log(`Created new TwitchWatch Model for \`${merged.guildname}\``));
		}
	};

	//Get Guild Twitch Channels
	bot.getTwitchWatch = async (guild) => {
		if (!guild) throw new Error('No Guild Provided!');
		const data = await TwitchWatch.findOne({ guildid: guild.id });
		if (data) return data;
		else return bot.twitchwatchDefaults.defaultSettings;
	};

	// Remove TwitchChannel from Guild
	bot.removeTwitchChannel = async (guild, settings) => {
		if (!guild) throw new Error('No Guild Provided!');
		const data = await TwitchWatch.findOne({ guildid: guild.id });
		const guildTwitchChannels = await data.twitchchannels;
		const removeChannel = await guildTwitchChannels.find((u) => u.userid === settings.userid);
		if (typeof settings !== 'object') return console.log('User did not provide an object, Returning.');

		guildTwitchChannels.pull(removeChannel);
		data.save();
	};

	//Calculate needed xp
	const getNeededXP = (level) => level * level * 50;

	//Add XP to Member
	bot.addXP = async (guild, member, xpToAdd, bot, settings, levelChannel, message) => {
		try {
			const result = await userData.findOneAndUpdate(
				{ guildid: guild.id, userid: member.id },
				{
					guildid: guild.id,
					userid: member.id,
					$inc: {
						xp: xpToAdd,
					},
				},
				{
					upsert: true,
					new: true,
				}
			);

			let { xp, level } = result;
			const needed = getNeededXP(level);
			if (xp >= needed) {
				++level;
				xp -= needed;

				//Check for level role, add it if it exists
				const levelRoles = await Levelroles.find({ guildid: guild.id, level: { $lte: level } });
				let addedRoles = [];
				if (levelRoles) {
					for await (const lr of levelRoles) {
						if (member.roles.cache.has(lr.roleid)) continue;
						const role = await guild.roles.cache.get(lr.roleid);
						try {
							await member.roles.add(role);
							addedRoles.push(role);
						} catch (error) {
							console.log(error);
						}
					}
				}
				//Generate Embed
				const embed = new MessageEmbed()
					.setTitle('Level Up!')
					.setColor(settings.guildcolor)
					.setThumbnail(`${member.displayAvatarURL({ dynamic: true })}`)
					.setDescription(
						`<:hypesquad:753802620342108161> Congratulations ${member.displayName}!\nYou are now level ${level}!${
							addedRoles.length ? `\nAwarded Role${addedRoles.length >= 1 ? 's›\n' : '›\n'}` : ''
						}${addedRoles.map((r) => r).join(' | ')}${message ? `\n[Jump to Level Message](${message.url})` : ''}`
					)
					.setFooter({ text: `• Next Level› ${bot.toThousands(xp)}/${bot.toThousands(getNeededXP(level))} •` });

				levelChannel.send({ embeds: [embed] });
			}

			await userData.updateOne({ guildid: guild.id, userid: member.id }, { level, xp });
		} catch (e) {
			console.error(e);
		}
	};

	bot.awardVoiceXP = async (xpToAdd, guild, bot) => {
		//Declarations
		const settings = await bot.getGuild(guild);
		const levelChannel = await guild.channels.cache.get(settings.levelchannel);

		//Checks
		if (!levelChannel) return;
		if (!guild.afkChannel) return;

		//Get Channels
		const channels = await guild.channels.cache
			.filter((ch) => ch.type === 'GUILD_VOICE')
			.filter(function (x) {
				return x !== undefined;
			});

		//Loop Channels
		await channels.forEach(async (chan) => {
			const channel = await bot.channels.cache.get(chan.id);
			if (channel.id === guild.afkChannelId) return;
			const members = await channel.members;
			if (members.size <= 1) return;

			//Loop Members
			for await (const mem of members) {
				const member = mem[1];
				if (member.user.bot) return;
				if (bot.Debug) console.log(`Granting ${xpToAdd} Voice XP to ${member.displayName}`);
				await bot.addXP(guild, member, xpToAdd, bot, settings, levelChannel);
			}
		});
	};

	//BotData
	bot.updateBotData = async (bot) => {
		await BotData.findOneAndUpdate(
			{},
			{
				botuptime: moment.duration(bot.uptime).format('Y[Y] M[M] W[W] D[D] H[h] m[m]'),
				totalguilds: bot.toThousands(bot.guilds.cache.size),
				totalusers: bot.toThousands(bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)),
			},
			{
				upsert: true,
				new: true,
			}
		);
	};
};
