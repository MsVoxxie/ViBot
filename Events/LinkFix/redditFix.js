const { Vimotes } = require('../../Storage/Functions/miscFunctions');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { post } = require('request');
const { join } = require('path');
const { log } = require('console');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		// If Partial, Fetch
		if (message.partial) {
			await message.fetch();
		}

		//Checks
		if (message.author.bot) return;

		//Declarations
		const RegEx = /http(?:s)?:\/\/(?:www\.)?(?:[\w-]+?\.)?reddit.com(\/r\/|\/user\/)?([\w:]{2,21})(\/comments\/)?(\w{5,6})(?:\/[\w%\\\\-]+)?\//gi;
		const Matches = [...message.content.matchAll(RegEx)];
		if (!Matches.length) return;
		const postURL = `${Matches?.[0]?.[0]}.json`;
		const settings = await bot.getGuild(message.guild);

		//Statics
		const ORIG_MESSAGE = '**Originally Posted By›** ';
		const AUTH_POST = `**${message.author}›** `;
		const MEDIA_PATH = path.join(__dirname, '../../Storage/Media/Temp/');
		const REACTION = '📡';

		//Check if Message is a reddit post
		if (!Matches.length) return;

        //Check if the post embeded on its own
        if (message.embeds.length) return;

		// Add Reaction
		await message.react(REACTION);

		//Create Filter
		const filter = (reaction, user) => reaction.emoji.name === REACTION && user.id === message.author.id;
		const collector = message.createReactionCollector({ filter, time: 60 * 1000, error: ['time'] });

		//Collector Collects
		collector.on('collect', async () => {
			//Get original message without links
			let originalMessage = message.content;
			originalMessage = originalMessage.replace(Matches[0][0], '').trim();

			//Get Post
			const response = await axios.get(postURL);
			const postDetails = response.data?.[0].data.children?.[0].data;
			const postMedia = response.data?.[0].data.children?.[0].data.secure_media;

			//Get Post Details
			const mediaURL = postMedia?.reddit_video?.fallback_url.replace('?source=fallback', '');
			if (!mediaURL) return console.log('No media');
			const mediaVideo = mediaURL;
			if (!mediaVideo) return console.log('No video');
			const mediaAudio = mediaURL.replace('DASH_1080', 'DASH_audio');

			//Dirty post data
			const postData = {
				title: postDetails.title,
				subreddit: postDetails.subreddit_name_prefixed,
				author: postDetails.author,
				postid: postDetails.id,
				posturl: postDetails.url_overridden_by_dest,
				media: {
					duriation: postMedia?.reddit_video?.duration,
				},
				imnpressions: {
					ups: postDetails.ups,
					downs: postDetails.downs,
				},
			};

			if (postData.media.duriation > 60) {
				await message?.reactions?.removeAll();
				await message.react('❌');
				return;
			}

			//Make the lines pretty :)
			const intData = `⬆️ [${bot.toThousands(postData.imnpressions.ups)}] ⬇️ [${bot.toThousands(postData.imnpressions.downs)}]`;
			const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

			//Combine Media
			const Encoder = new ffmpeg();
			Encoder.autopad()
				.addInput(mediaVideo)
				.output(`${MEDIA_PATH}${postData.postid}.mp4`)
				.format('mp4')
				.on('error', (err) => console.log(err))
				.on('progress', (progress) => console.log(`Processing: ${Math.round(progress.percent)}%`));

			if (mediaAudio) {
				Encoder.addInput(mediaAudio);
			}

			const waitMsg = await message.reply('Encoding video. This may take a while.');
			await Encoder.run();

			Encoder.on('end', async () => {
				try {
					//Get the file
					const attachment = new MessageAttachment(`${MEDIA_PATH}${postData.postid}.mp4`, `${postData.postid}.mp4`);
					console.log(attachment);

					await waitMsg.delete();

					//Create Embed
					const embed = new MessageEmbed()
						.setAuthor({ name: postData.author })
						.setTitle(`${postData.subreddit} - ${postData.title}`)
						.setURL(postData.posturl)
						.setDescription(`${wrapLines}\n${intData}\n${wrapLines}`)
						.setColor(settings.guildcolor);

					//Send Embed
					await message.channel.send({
						content: `${originalMessage ? `${AUTH_POST} ${originalMessage}` : `${ORIG_MESSAGE} ${message.author}`}`,
						embeds: [embed],
						files: [attachment],
					});

					//Delete the file
					fs.unlinkSync(`${MEDIA_PATH}${postData.postid}.mp4`, (err) => {
						if (err) throw err;
					});

					//Delete the original message
					await message.delete();
				} catch (err) {
					console.log(err);
				}
			});
		});

		//Collector Ends
		collector.on('end', async (collected, reason) => {
			if (reason === 'time') {
				await message?.reactions?.cache?.first()?.users?.remove(bot.user.id);
			}
		});
	},
};
