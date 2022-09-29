const mongoose = require('mongoose');
const moment = require('moment');
require('moment-duration-format');
const { MessageEmbed } = require('discord.js');
const { Statistics, BotData, Guild, Levelroles, TwitchWatch, userData, Starboard } = require('../Database/models');

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

	//Check Level Roles
	bot.checkLevelRoles = async (guild, member, level) => {
		return new Promise(async (resolve, reject) => {
			//Check for level role, add it if it exists
			const levelRoles = await Levelroles.find({ guildid: guild.id, level: level }); // Redo this later
			let addedRoles = [];
			let removedRoles = [];
			if (levelRoles) {
				for await (const lr of levelRoles) {
					switch (lr.type) {
						// Add
						case 'add': {
							if (member.roles.cache.has(lr.roleid)) continue;
							const role = await guild.roles.cache.get(lr.roleid);
							try {
								await member.roles.add(role);
								addedRoles.push(role);
							} catch (error) {
								console.log(error);
							}
							break;
						}
						// Remove
						case 'remove': {
							if (!member.roles.cache.has(lr.roleid)) continue;
							const role = await guild.roles.cache.get(lr.roleid);
							try {
								await member.roles.remove(role);
								removedRoles.push(role);
							} catch (error) {
								console.log(error);
							}
							break;
						}
					}
				}
			}
			resolve({ addedRoles, removedRoles });
		});
	};

	//Add XP to Member
	bot.addXP = async (guild, member, xpToAdd, bot, settings, levelChannel, message, check) => {
		try {
			const result = await userData.findOneAndUpdate(
				{ guildid: guild.id, userid: member.id },
				{ guildid: guild.id, userid: member.id, $inc: { xp: xpToAdd, xpinterval: 1 } },
				{ upsert: true, new: true }
			);

			let { xp, level, xpinterval } = result;
			const needed = getNeededXP(level);
			if (xp >= needed) {
				++level;
				xp -= needed;

				const RoleCheck = await bot.checkLevelRoles(guild, member, result.level + 1);

				//Generate Embed
				const embed = new MessageEmbed()
					.setTitle('Level Up!')
					.setColor(settings.guildcolor)
					.setThumbnail(`${member.displayAvatarURL({ dynamic: true })}`)
					.setDescription(
						`<:hypesquad:753802620342108161> Congratulations ${member.displayName}!\nYou are now level ${level}!${
							RoleCheck.addedRoles.length ? `\nAwarded Role${RoleCheck.addedRoles.length >= 1 ? 's»\n' : '»\n'}` : ''
						}${RoleCheck.addedRoles.map((r) => r).join(' | ')}${
							RoleCheck.removedRoles.length ? `\nRevoked Role${RoleCheck.removedRoles.length >= 1 ? 's»\n' : '»\n'}` : ''
						}${RoleCheck.removedRoles.map((r) => r).join(' | ')}${message ? `\n[Jump to Level Message](${message.url})` : ''}`
					)
					.setFooter({
						text: `• Next Level» ${Math.round(bot.percentage(xp, getNeededXP(level)))}% | ${bot.toThousands(xp)}/${bot.toThousands(
							getNeededXP(level)
						)} •`,
					});

				levelChannel.send({ embeds: [embed] });
			}

			await userData.updateOne(
				{ guildid: guild.id, userid: member.id },
				{ level, xp, xpinterval: result.xpinterval >= 10 ? 0 : result.xpinterval }
			);
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

	// Message Statistics
	bot.updateMessageStatistics = async (message) => {
		let baseWords = message.content.toLowerCase();
		const AsciiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
		const URLRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
		const DiscordEmojiRegex = /(<a?)?:\w+:(\d{0,100}>)?/gi;
		const DiscordRegex = /<(?:@[!&]?|#)\d+>/gi;

		// Trim down any white spaces and clean string
		baseWords = await baseWords
			.replace(DiscordRegex, '')
			.replace(DiscordEmojiRegex, '')
			.replace(AsciiRegex, '')
			.replace(URLRegex, '')
		let splitWords = baseWords.split(/ +/);
		splitWords.map((w) => w.trim());
		splitWords = splitWords.filter((item) => item);

		if (!splitWords.length) return;

		console.log(splitWords);

		for await (const uWord of splitWords) {
			let hasDoc = await Statistics.countDocuments({ guildid: message.guild.id, words: { $elemMatch: { word: uWord } } });
			if (hasDoc > 0) {
				await Statistics.updateOne(
					{ guildid: message.guild.id, words: { $elemMatch: { word: uWord } } },
					{ guildid: message.guild.id, $inc: { 'words.$.count': 1 } }
				);
			} else {
				hasDoc = await Statistics.countDocuments({ guildid: message.guild.id, words: [] });
				if (hasDoc > 0) {
					await Statistics.create({ guildid: message.guild.id, words: [] });
				} else {
					await Statistics.findOneAndUpdate({ guildid: message.guild.id }, { $push: { words: { word: uWord, count: 1 } } }, { upsert: true });
				}
			}
		}
	};

	//Clear Failed Stars
	bot.pruneStarboard = async () => {
		await Starboard.deleteMany({ starred: false }).then(() => console.log('Starboard Pruned.'));
	};
};
