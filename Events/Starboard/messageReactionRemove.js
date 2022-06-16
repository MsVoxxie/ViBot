const { Starboard } = require('../../Storage/Database/models/');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'messageReactionRemove',
	disabled: false,
	once: false,
	async execute(reaction, user, bot, Vimotes) {
		//Check if message was partial, if so fetch it.
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}
		//Defininitions
		const message = await reaction.message;
		const settings = await bot.getGuild(message.guild);
		let attachment;
		let embeds = [];
		let StarData;
		let type;

		//Checks
		if (reaction.emoji.name !== '⭐') return;
		// if (message.author.id === user.id) return;
		if (message.author.bot) return;

		//Random Star!
		const starEmojis = ['💫', '⭐', '🌟', '✨'];
		const randStar = starEmojis[Math.floor(Math.random() * starEmojis.length)];

		//Get Counts
		const ReactLimit = 5;
		const starCount = await message.reactions.cache.get('⭐').count || 0;

		//get starchannel
		const starChannelID = await settings.starchannel;
		const starChannel = await message.guild.channels.cache.get(starChannelID);
		if (!starChannel) return;

		//Check if message is already starred
		const ExistingStar = await Starboard.findOne({ guildid: message.guild.id, messageid: message.id });

		//If message is already starred, update star count
		if (ExistingStar) {
			StarData = await Starboard.findOneAndUpdate(
				{ guildid: message.guild.id, messageid: message.id },
				{ $set: { starcount: starCount } },
				{ new: true, upsert: true }
			);
		} else {
			//If message is not starred, create new star
			StarData = await Starboard.findOneAndUpdate(
				{ guildid: message.guild.id, authorid: message.author.id, messageid: message.id, channelid: message.channel.id },
				{ $set: { guildid: message.guild.id, messageid: message.id, starcount: starCount, starred: false } },
				{ new: true, upsert: true }
			);
		}

		//Check for Images or URL's
		const mediaData = await bot.hasMedia(message);
		//Get Type
		if (mediaData.videos.length > 0) {
			type = 'Video';
		} else if (mediaData.images.length > 0) {
			type = 'Image';
		} else if (mediaData.tweetData) {
			type = 'Tweet';
		}
		// Check if the messages is empty.
		if (!mediaData && message.content.length < 1)
			return message.reply(`You cannot star an empty message.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		//Embeds
		switch (type) {
			case 'Tweet': {
				const intData = `♥️ [${bot.toThousands(mediaData.tweetData.tweet.likes)}] 🔃 [${bot.toThousands(mediaData.tweetData.tweet.retweets)}]`;
				const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

				if (!mediaData.tweetData.tweet.video_url) {
					for await (const photo of mediaData.tweetData.tweet.media_urls) {
						const embed = new MessageEmbed()
							.setColor('#c2b04e')
							.setURL(message.url)
							.setDescription(`${mediaData.tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}\n\n${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
							.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
							.setImage(photo)
							.setFooter({ text: `MessageID: ${message.id}` });
						embeds.push(embed);
					}
				} else {
					const embed = new MessageEmbed()
						.setAuthor({ name: `@${mediaData.tweetData.user.screen_name}` })
						.setTitle(mediaData.tweetData.user.name)
						.setURL(mediaData.tweetData.tweet.url)
						.setThumbnail(mediaData.tweetData.user.profile_image_url)
						.setDescription(`${mediaData.tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
						.setColor(settings.guildcolor);
					attachment = new MessageAttachment(mediaData.tweetData.tweet.video_url, `media.mp4`);
					embeds.push(embed);
				}
				break;
			}

			//Video
			case 'Video': {
				const embed = new MessageEmbed()
					.setColor('#c2b04e')
					.setURL(message.url)
					.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
					.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
					.setFooter({ text: `MessageID: ${message.id}` });
				embeds.push(embed);
				if (mediaData.videos.length > 0) {
					attachment = new MessageAttachment(mediaData.videos[0], `media.mp4`);
				}
				break;
			}

			//Image
			case 'Image': {
				for await (const media of mediaData.images) {
					const embed = new MessageEmbed()
						.setColor('#c2b04e')
						.setURL(message.url)
						.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
						.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
						.setImage(media)
						.setFooter({ text: `MessageID: ${message.id}` });
					embeds.push(embed);
				}
				break;
			}

			//Text
			default: {
				const embed = new MessageEmbed()
					.setColor('#c2b04e')
					.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
					.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
					.setFooter({ text: `MessageID: ${message.id}` });
				embeds.push(embed);
				break;
			}
		}

		//Fetch Messages and find Star Message
		const Messages = await starChannel.messages.fetch({ limit: 100 });
		const Message = await Messages.find((m) => m.id === StarData.starid);

		if (StarData && StarData.starcount < ReactLimit) {
			//If less than ReactLimit delete message
			setTimeout(async () => {
				await Message.delete();
				await Starboard.deleteOne({ guildid: message.guild.id, messageid: message.id });
			}, 5 * 1000);
		} else {
			//If Star was Deleted in channel, remove entry
			if (!Message) return await Starboard.deleteOne({ guildid: message.guild.id, messageid: message.id });
			//Update Star Message
			await Message.edit({ content: `${randStar} ${StarData.starcount} | <#${message.channel.id}>`, embeds: embeds.map((e) => e) });
		}
	},

	//Functions
	imageAttachment(message) {
		const imageLink = message.attachments.first().url.split('.');
		const typeOfImage = imageLink[imageLink.length - 1];
		const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
		if (!image) return '';
		return message.attachments.first().url;
	},

	imageURL(message) {
		let imgRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/.exec(message.content);
		return imgRegex;
	},
};
