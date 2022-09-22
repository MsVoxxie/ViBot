const { TwitchLive } = require('../Database/models');
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
	// Check Streams
	bot.twitchLiveCheck = async () => {
		// Get Every guilds watch list
		const guilds = bot.guilds.cache;
		for await (const g of guilds) {
			const guild = g[1];
			const settings = await bot.getGuild(guild);
			const watchedChannels = await TwitchLive.find({ guildid: guild.id });
			if (!watchedChannels) continue;

			// Loop watched channels
			for await (const channel of watchedChannels) {
				// Where should this be sent?
				const steamchannel = await guild.channels.cache.get(settings.twitchchannel);
				const redirectchannel = await guild.channels.cache.get(channel.redirect);
				if (!steamchannel && !redirectchannel) continue;
				const channelToSend = redirectchannel ? redirectchannel : steamchannel;

				// Get Channel Data
				const Stream = await TwitchClient.streams.getStreamByUserName(channel.twitchid);

				if (Stream) {
					// Configure Random Message
					const randmsg = randomNotif[Math.floor(Math.random() * randomNotif.length)];
					const mentionMsg = randmsg.replace('{everyone}', '@everyone').replace('{twname}', channel.twitchid);
					const streamMsg = randmsg.replace('{everyone}', 'everyone').replace('{twname}', channel.twitchid);

					if (!channel.live) {
						console.log('0');
						await setEmbed(Stream, channel);
						const last = await channelToSend.send({ content: `${settings.twitchmention ? mentionMsg : streamMsg}`, embeds: [embed] });

						// Update db
						await TwitchLive.findOneAndUpdate(
							{ guildid: guild.id, twitchid: channel.twitchid },
							{ lastpost: Date.now(), lastmsg: last, live: true },
							{ upsert: true, new: true }
						);
					} else {
						console.log('1');
						const lastPost = await channelToSend.messages.fetch(channel.lastmsg);
						await setEmbed(Stream, channel);
						await lastPost.edit({ content: `${settings.twitchmention ? mentionMsg : streamMsg}`, embeds: [embed] }).then((t) => {
							console.log('Edited');
						});
					}
				}

				if (!Stream && channel.live) {
					const lastPost = await channelToSend.messages.fetch(channel.lastmsg);
					setEmbedOffline(Stream, channel);
					await lastPost.edit({ content: null, embeds: [offembed] });

					// Update db
					await TwitchLive.findOneAndUpdate(
						{ guildid: guild.id, twitchid: channel.twitchid },
						{ lastpost: Date.now(), live: false },
						{ upsert: true, new: true }
					);
				}
			}
		}
	};

	let embed;
	async function setEmbed(stream, chan) {
		embed = new MessageEmbed()
			.setColor('#6441a4')
			.setTitle(`${(await stream.getUser()).displayName}`)
			.setURL(`https://www.twitch.tv/${chan.twitchid}`)
			// .setDescription(`[https://www.twitch.tv/${chan.twitchid}](https://www.twitch.tv/${chan.twitchid})`)
			.setThumbnail((await stream.getUser()).profilePictureUrl)
			.setImage(stream.thumbnailUrl.replace('{width}', 960).replace('{height}', 540))
			.addFields(
				{ name: 'Playing»', value: `${(await stream.getGame()).name}`, inline: true },
				{ name: 'Current Viewers»', value: `${bot.toThousands(stream.viewers)}`, inline: true },
				{ name: 'Live Since»', value: `${bot.relativeTimestamp(stream.startDate)}`, inline: false }
			);
		return embed;
	}

	let offembed;
	async function setEmbedOffline(stream, chan) {
		offembed = new MessageEmbed()
			.setColor('#303c42')
			.setTitle(`${chan.twitchid}'s stream has ended.`)
			.setDescription(`[https://www.twitch.tv/${chan.twitchid}](https://www.twitch.tv/${chan.twitchid})`)
			.setThumbnail('https://cdn.iconscout.com/icon/free/png-256/social-190-96705.png');
		//.setFooter({ text: `As of» ${bot.Timestamp(Date.now())}` });
		return offembed;
	}
};
