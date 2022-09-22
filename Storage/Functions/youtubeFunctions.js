const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Youtube } = require('../Database/models/');
const { parse } = require('node-html-parser');
const fetch = require('node-fetch');

module.exports = async (bot) => {
	// Check Streams
	bot.youtubeLiveCheck = async () => {
		// Get Every guilds watch list
		const guilds = bot.guilds.cache;
		for await (const g of guilds) {
			const guild = g[1];
			const settings = await bot.getGuild(guild);
			const watchedChannels = await Youtube.find({ guildid: guild.id });
			if (!watchedChannels) continue;

			// Loop watched channels
			for await (const channel of watchedChannels) {
				// Where should this be sent?
				const steamchannel = await guild.channels.cache.get(settings.twitchchannel);
				const redirectchannel = await guild.channels.cache.get(channel.redirect);
				if (!steamchannel && !redirectchannel) continue;
				const channelToSend = redirectchannel ? redirectchannel : steamchannel;

                // Get Channel Data
				const channelData = await getLiveStatus(channel.channelid);
				if (channelData.isStreaming && !channel.live) {

                    const randomNotif = [
                        'Hey {everyone}! {twname} is now live!',
                        'Heads up {everyone}, {twname} is going live!',
                        '{twname} is live {everyone}!',
                        "It's that time again {everyone}, Time to watch {twname}!",
                    ];
                    const randmsg = randomNotif[Math.floor(Math.random() * randomNotif.length)];
				    const mentionMsg = randmsg.replace('{everyone}', '@everyone').replace('{twname}', channel.channelname);
				    const streamMsg = randmsg.replace('{everyone}', 'everyone').replace('{twname}', channel.channelname);
                    const last = await channelToSend.send({ content: `${settings.twitchmention ? `${mentionMsg}\n${channelData.streamURL}` : `${streamMsg}\n${channelData.streamURL}`}`});
				
                    // Update db
					await Youtube.findOneAndUpdate(
						{ guildid: guild.id, channelid: channel.channelid },
						{ lastpost: Date.now(), lastmsg: last, live: true, },
                        { upsert: true, new: true});
				}

                if(!channelData.isStreaming && channel.live) {
                    const lastPost = await channelToSend.messages.fetch(channel.lastmsg);
                    await lastPost.edit({content: `${channel.channelname} is now offline.`})

                    // Update db
					await Youtube.findOneAndUpdate(
						{ guildid: guild.id, channelid: channel.channelid },
						{ lastpost: Date.now(), live: false, },
                        { upsert: true, new: true});
                }

			}
		}
	};

	// Check for steam
	async function getLiveStatus(channelID) {
		return new Promise(async (resolve, reject) => {
			try {
				let response = await fetch(`https://youtube.com/channel/${channelID}/live`);
				let text = await response.text();
				if (text.includes('404')) {
					response = await fetch(`https://youtube.com/c/${channelID}/live`);
					text = await response.text();
				}
				const html = parse(text);
				const canonicalURLTag = html.querySelector('link[rel=canonical]');
				const canonicalURL = canonicalURLTag.getAttribute('href');
				const isStreaming = canonicalURL.includes('/watch?v=');

				resolve({
					streamURL: canonicalURL,
					isStreaming,
				});
			} catch (error) {
				reject(error);
			}
		});
	}
};
