const { userData } = require('../../Storage/Database/models/');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'voiceStateUpdate',
	disabled: false,
	once: false,
	async execute(oldState, newState, bot, Vimotes) {
		//Declarations / checks
		let userid = oldState.id || newState.id;
		let guildid = oldState.guild.id || newState.guild.id;
		let guild = await bot.guilds.cache.find((g) => g.id === guildid);
		let author = await guild.members.cache.find((a) => a.id === userid);
		if (author && author.bot === true) return;

		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup channel strings
		let oldchannelid = 'unknown';
		if (oldState && oldState.channel && oldState.channel.parent && oldState.channel.parent.name) oldparentname = oldState.channel.parent.name;
		if (oldState && oldState.channel && oldState.channel.name) oldchannelname = oldState.channel.name;
		if (oldState && oldState.channelId) oldchannelid = oldState.channelId;

		let newchannelid = 'unknown';
		if (newState && newState.channel && newState.channel.parent && newState.channel.parent.name) newparentname = newState.channel.parent.name;
		if (newState && newState.channel && newState.channel.name) newchannelname = newState.channel.name;
		if (newState && newState.channelId) newchannelid = newState.channelId;

		//Joined Voice Channel
		if (!oldState.channelId && newState.channelId && !oldState.channel && newState.channel) {

			//Database Entry
			await userData.findOneAndUpdate(
				{ guildid: guildid, userid: userid },
				{
					$set: {
						lastvoice: {
							jointime: Date.now(),
						}
					},
				},
				{ upsert: true }
			);

			//Embed
			embed = new MessageEmbed()
				.setTitle('User Joined Voice Channel')
				.setThumbnail(author.displayAvatarURL({ dynamic: true }))
				.setDescription(`**User›** <@${author.id}>\n**UserID›** \`${author.id}\`\n**ChannelID›** \`${newchannelid}\`\n**Connected›** **<t:${Math.round(Date.now() / 1000)}:R>**`)
				.addField('**Voice Channel›**', `<#${newchannelid}>`, true)
				.setColor(settings.guildcolor);
			logChannel.send({ embeds: [embed] });
		}

		//Left Voice Channel
		if (oldState.channelId && !newState.channelId && oldState.channel && !newState.channel) {

			//Database Entry
			const oldData = await userData.findOne({ guildid: guildid, userid: userid }).lean();
			const oldVoice = oldData.lastvoice;
			const newData = await userData.findOneAndUpdate(
				{ guildid: guildid, userid: userid },
				{
					$set: {
						lastvoice: {
							jointime: oldVoice.jointime,
							leavetime: Date.now(),
						}
					},
				},
				{ upsert: true, new: true }
			);

			//Embed
			embed = new MessageEmbed()
				.setTitle('User Left Voice Channel')
				.setThumbnail(author.displayAvatarURL({ dynamic: true }))
				.setDescription(`**User›** <@${author.id}>\n**UserID›** \`${author.id}\`\n**ChannelID›** \`${oldchannelid}\`\n**Duration›** \`${bot.getDuration(newData.lastvoice.jointime, newData.lastvoice.leavetime).join(' ')}\`\n**Disconnected›** <t:${Math.round(Date.now() / 1000)}:R>`)
				.addField('**Voice Channel›**', `<#${oldchannelid}>`, true)
				.setColor(settings.guildcolor);
			logChannel.send({ embeds: [embed] });
		}

		//Switched Voice Channel
		if (oldState.channelId && newState.channelId && oldState.channel && newState.channel) {
			// False positive check
			if (oldState.channelId !== newState.channelId) {

				//Database Entry
				const oldData = await userData.findOne({ guildid: guildid, userid: userid }).lean();
				const oldVoice = oldData.lastvoice;
				await userData.findOneAndUpdate(
					{ guildid: guildid, userid: userid },
					{
						$set: {
							lastvoice: {
								jointime: Date.now(),
								leavetime: Date.now(),
							}
						},
					},
					{ upsert: true }
				);

				//Embed
				embed = new MessageEmbed()
					.setTitle('User Switched Voice Channels')
					.setThumbnail(author.displayAvatarURL({ dynamic: true }))
					.setDescription(`**User›** <@${author.id}>\n**UserID›** \`${author.id}\`\n**OldChannelID›** \`${oldchannelid}\`\n**NewChannelID›** \`${newchannelid}\`\n**Duration›** \`${bot.getDuration(oldVoice.jointime, Date.now()).join(' ')}\`\n**Switched›** <t:${Math.round(Date.now() / 1000)}:R>`)
					.addField('**Left Channel›**', `<#${oldchannelid}>`, true)
					.addField('**Joined Channel›**', `<#${newchannelid}>`, true)
					.setColor(settings.guildcolor);
				logChannel.send({ embeds: [embed] });
			}
		}
	},
};
