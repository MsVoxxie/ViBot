const { TwitchWatch } = require('../Database/models');
const { TwitchClientID, TwitchAccessToken } = require('../Config/Config.json');
const { MessageEmbed } = require('discord.js');
const { ApiClient } = require('@twurple/api');
const { ClientCredentialsAuthProvider } = require('@twurple/auth');

const clientid = TwitchClientID;
const accesstoken = TwitchAccessToken;
const authProvider = new ClientCredentialsAuthProvider(clientid, accesstoken);
const TwitchClient = new ApiClient({ authProvider });

module.exports = (bot) => {
	bot.twitchWatch = async () => {
		bot.guilds.cache.forEach(async (guild) => {
			const settings = await bot.getGuild(guild);
			const data = await TwitchWatch.findOne({ guildid: guild.id });
			if (!data) return;
			const TwitchChannels = data.twitchchannels;
			const streamChannel = await guild.channels.cache.get(settings.twitchchannel);
			if (!streamChannel) return;
			if (!TwitchChannels) return;

			// Check if the channel is live
			TwitchChannels.forEach(async (channel) => {
				const Update = TwitchChannels.find((ch) => ch.channelname === channel.channelname);
				let postMsg;
				const Stream = await TwitchClient.helix.streams.getStreamByUserName(channel.channelname);
				if (Stream) {
					try {
						if (channel.postmessage) {
							const checkMsg = await streamChannel.messages.fetch(channel.postmessage);
							const streamMsg = await checkMsg.fetch(channel.postmessage);
							if (streamMsg) {
								await setEmbed(Stream, channel);
								streamMsg.edit({ embeds: [embed] });
							}
						} else {
							await setEmbed(Stream, channel);
							postMsg = await streamChannel.send({ embeds: [embed] });

							Update.postmessage = postMsg.id;
							Update.lastpost = Date.now();
							if (channel.offline === true) {
								Update.offline = false;
							}

							await data.markModified('twitchchannels');
							await data.save();
						}
					} catch (e) {
						console.log(e);
					}
				} else {
					try {
						if (channel.offline === false) {
							const checkMsg = await streamChannel.messages.fetch({ limit: 100 });
							const streamMsg = await checkMsg.fetch(channel.postmessage);
							setEmbedOffline(Stream, channel);
							streamMsg.edit({ embeds: [offembed] });
							Update.offline = true;
						}
						Update.postmessage = '';

						await data.markModified('twitchchannels');
						await data.save();
					} catch (error) {
						console.log(error);
					}
				}
			});
		});
	};
	let embed;
	async function setEmbed(stream, chan) {
		embed = new MessageEmbed()
			.setColor('#6441a4')
			.setTitle(`${(await stream.getUser()).displayName} is now live!`)
			.setDescription(`[https://www.twitch.tv/${chan.channelname}](https://www.twitch.tv/${chan.channelname})`)
			.setThumbnail((await stream.getUser()).profilePictureUrl)
			.setImage(stream.thumbnailUrl.replace('{width}', 960).replace('{height}', 540))
			.addField('Playing›', `${(await stream.getGame()).name}`, true)
			.addField('Current Viewers›', `${stream.viewers}`, true)
			.addField('Live Since›', `${bot.Timestamp(stream.startDate)}`)
			.setFooter(`Last Updated› ${bot.Timestamp(Date.now())}`);
		return embed;
	}

	let offembed;
	async function setEmbedOffline(stream, chan) {
		offembed = new MessageEmbed()
			.setColor('#303c42')
			.setTitle(`${chan.channelname}'s stream has ended.`)
			.setDescription(`[https://www.twitch.tv/${chan.channelname}](https://www.twitch.tv/${chan.channelname})`)
			.setThumbnail('https://cdn.iconscout.com/icon/free/png-256/social-190-96705.png')
			.setFooter(`As of› ${bot.Timestamp(Date.now())}`);
		return offembed;
	}
};
