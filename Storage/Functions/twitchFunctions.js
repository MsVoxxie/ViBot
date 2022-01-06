const { TwitchWatch } = require('../Database/models');
const { TwitchClientID, TwitchAccessToken } = require('../Config/Config.json');
const { MessageEmbed } = require('discord.js');
const { ApiClient } = require('@twurple/api');
const { ClientCredentialsAuthProvider } = require('@twurple/auth');

const clientid = TwitchClientID;
const accesstoken = TwitchAccessToken;
const authProvider = new ClientCredentialsAuthProvider(clientid, accesstoken);
const TwitchClient = new ApiClient({ authProvider });

const randomNotif = [
	'Hey {everyone}! {twname} is now live!',
	'Heads up {everyone}, {twname} is going live!',
	'{twname} is live {everyone}!',
	"It's that time again {everyone}, Time to watch {twname}!",
];

module.exports = (bot) => {
	bot.twitchWatch = async () => {
		await bot.guilds.cache.map(async (guild) => {
			const settings = await bot.getGuild(guild);
			const data = await TwitchWatch.findOne({ guildid: guild.id });
			if (!data) return;
			const TwitchChannels = data.twitchchannels;
			const streamChannel = await guild.channels.cache.get(settings.twitchchannel);
			if (!streamChannel) return;
			if (!TwitchChannels) return;

			// Check if the channel is live
			for await (const channel of TwitchChannels) {
				const Update = TwitchChannels.find((ch) => ch.channelname === channel.channelname);
				const randmsg = await randomNotif[Math.floor(Math.random() * randomNotif.length)];
				const mentionMsg = randmsg.replace('{everyone}', '@everyone').replace('{twname}', channel.channelname);
				const streamMsg = randmsg.replace('{everyone}', 'everyone').replace('{twname}', channel.channelname);
				let postMsg;
				const Stream = await TwitchClient.streams.getStreamByUserName(channel.channelname);
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
							postMsg = await streamChannel.send({ content: `${settings.twitchmention ? mentionMsg : streamMsg}`, embeds: [embed] });

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
							const streamMsg = await checkMsg.get(channel.postmessage);
							setEmbedOffline(Stream, channel);
							if (streamMsg) {
								streamMsg.edit({ content: null, embeds: [offembed] }).then((s) => {
									if (settings.prune) setTimeout(() => s.delete(), 60 * 60 * 1000);
								});
							}
							Update.offline = true;
						}
						Update.postmessage = '';

						await data.markModified('twitchchannels');
						await data.save();
					} catch (error) {
						console.log(error);
					}
				}
			}
		});
	};
	let embed;
	async function setEmbed(stream, chan) {
		embed = new MessageEmbed()
			.setColor('#6441a4')
			.setTitle(`${(await stream.getUser()).displayName}`)
			.setURL(`https://www.twitch.tv/${chan.channelname}`)
			// .setDescription(`[https://www.twitch.tv/${chan.channelname}](https://www.twitch.tv/${chan.channelname})`)
			.setThumbnail((await stream.getUser()).profilePictureUrl)
			.setImage(stream.thumbnailUrl.replace('{width}', 960).replace('{height}', 540))
			.addField('Playing›', `${(await stream.getGame()).name}`, true)
			.addField('Current Viewers›', `${bot.toThousands(stream.viewers)}`, true)
			.addField('Live Since›', `${bot.relativeTimestamp(stream.startDate)}`);
		return embed;
	}

	let offembed;
	async function setEmbedOffline(stream, chan) {
		offembed = new MessageEmbed()
			.setColor('#303c42')
			.setTitle(`${chan.channelname}'s stream has ended.`)
			.setDescription(`[https://www.twitch.tv/${chan.channelname}](https://www.twitch.tv/${chan.channelname})`)
			.setThumbnail('https://cdn.iconscout.com/icon/free/png-256/social-190-96705.png');
		//.setFooter({ text: `As of› ${bot.Timestamp(Date.now())}` });
		return offembed;
	}
};
