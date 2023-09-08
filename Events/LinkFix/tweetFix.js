const { MessageEmbed, MessageAttachment } = require('discord.js');
const { userData } = require('../../Storage/Database/models/');

module.exports = {
	name: 'messageCreate',
	disabled: true,
	once: false,
	async execute(message, bot) {
		// If Partial, Fetch
		if (message.partial) {
			await message.fetch();
		}

		//Checks
		if (message.author.bot) return;

		//Declarations
		// const RegEx = /((https?):\/\/)?(www.)?(|mobile.|sx|ayy|vx|fx)tw(i|x)tter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}\S{0,30}/gi; <-- original regex
		const RegEx = /((https?):\/\/)?(www.)?[A-z0-9_.]{0,7}tw(i|x)tter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}\S{0,30}/gi; // <-- new regex
		const Matches = [...message.content.matchAll(RegEx)]
			.map((x) => x[0])
			.filter((x) => !x.endsWith('>'))
			.filter((x) => !x.endsWith('||')) // Respect commenting and null blocking urls
			.filter((x) => !x.endsWith('#')); // Override

		//Check if Message is a Tweet
		if (!Matches.length) return;

		//Variables
		const settings = await bot.getGuild(message.guild);
		let lastMessage = null;
		let loop = false;

		//Statics
		const ORIG_MESSAGE = '**Originally Posted By»** ';
		const AUTH_POST = `**${message.author}»** `;
		const MESSAGES = [];
		const USERDATA = await userData.findOne({ guildid: message.guild.id, userid: message.author.id }).lean();
		const USER_CHOICE = USERDATA.autoembed !== undefined ? USERDATA.autoembed: true;

		switch (USER_CHOICE) {
			// Automatic Mode
			case true:
				//Get original message without links
				let originalMessage = message.content;
				Matches.forEach((match) => {
					originalMessage = originalMessage.replace(match, '').trim();
				});

				//TryCatch in case of error..
				try {
					//Setup Variables to send to function and then run function
					const funcData = { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop, MESSAGES };
					await sendTweets(funcData);

					//Add a collector so users can delete accidental posts
					await MESSAGES[0].react('🗑️');
					const filter = (reaction, user) => ['🗑️'].includes(reaction.emoji.name) && message.author.id === user.id;
					const collector = MESSAGES[0].createReactionCollector({ filter, time: 60 * 1000 });
					collector.on('collect', async (reaction) => {
						try {
							await message.channel.bulkDelete(MESSAGES);
						} catch (error) {
							return;
						}
					});

					collector.on('end', async (collected, reason) => {
						if (reason === 'time') {
							await MESSAGES[0]?.reactions?.cache?.first()?.users?.remove(bot.user.id);
						}
					});

					//Delete Original Message
					message.denyDeleteEvent = true;
					await message.delete();
				} catch (err) {
					console.error(err);
					return;
				}
				break;

			// Manual Mode
			case false:
				// Add Reaction
				await message.react('🐦');

				//Create Filter
				const filter = (reaction, user) => reaction.emoji.name === '🐦' && user.id === message.author.id;
				const collector = message.createReactionCollector({ filter, time: 60 * 1000, error: ['time'] });

				//Collector Collects
				collector.on('collect', async () => {
					//Get original message without links
					let originalMessage = message.content;
					Matches.forEach((match) => {
						originalMessage = originalMessage.replace(match, '').trim();
					});

					//TryCatch in case of error..
					try {
						//Setup Variables to send to function and then run function
						const funcData = { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop, MESSAGES };
						await sendTweets(funcData);

						//Delete Original Message
						message.denyDeleteEvent = true;
						await message.delete();
					} catch (err) {
						console.error(err);
						return;
					}
				});

				//Collector Ends
				collector.on('end', async (collected, reason) => {
					if (reason === 'time') {
						await message?.reactions?.cache?.first()?.users?.remove(bot.user.id);
					}
				});
				break;
		}
	},
};

async function sendTweets(funcData) {
	//Declarations
	let { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop, MESSAGES } = funcData;

	//Loop through Matches
	for await (const Match of Matches) {
		//Remove first reaction and add loading emoji...
		await message.reactions?.removeAll();

		//Wait to not overload the API
		await bot.sleep(500);

		//Get Media
		const tweetData = await bot.getTweet(Match);

		//Send Method
		const sendMethod = async (data) => {
			const msgRef = await bot.getReference(message);
			if (lastMessage !== null) return lastMessage.reply(data);
			if (msgRef) return msgRef.reply(data);
			if (!msgRef) return message.channel.send(data);
		}

		//Make the lines pretty :)
		const intData = `♥️ [${bot.toThousands(tweetData.tweet.likes)}] 🔃 [${bot.toThousands(tweetData.tweet.retweets)}]`;
		const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

		//Create Embed
		const embeds = [];

		//Text Only
		if (tweetData.tweet.description && !tweetData.tweet.media_urls && !tweetData.tweet.video_url) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `@${tweetData.user.screen_name}`, url: `https://twitter.com/${tweetData.user.screen_name}` })
				.setTitle(tweetData.user.name)
				.setURL(tweetData.tweet.url)
				.setThumbnail(tweetData.user.profile_image_url)
				.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
				.setFooter({ text: message.member.displayName, iconURL: message.member.displayAvatarURL() })
				.setTimestamp()
				.setColor(settings.guildcolor);
			embeds.push(embed);

			//This Sucks, but it works!
			if (!loop) {
				lastMessage = await sendMethod({
					content: `${originalMessage ? `${AUTH_POST} ${originalMessage}` : `${ORIG_MESSAGE} ${message.author}`}`,
					embeds: embeds.map((e) => e),
				});
			} else {
				lastMessage = await sendMethod({ embeds: embeds.map((e) => e) });
			}
		}

		//Media Only
		if (tweetData.tweet.media_urls && !tweetData.tweet.video_url) {
			for await (const photo of tweetData.tweet.media_urls) {
				const embed = new MessageEmbed()
					.setAuthor({ name: `@${tweetData.user.screen_name}`, url: `https://twitter.com/${tweetData.user.screen_name}` })
					.setTitle(tweetData.user.name)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setImage(tweetData.tweet.video_url ? null : photo)
					.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
					.setFooter({ text: message.member.displayName, iconURL: message.member.displayAvatarURL() })
					.setTimestamp()
					.setColor(settings.guildcolor);
				embeds.push(embed);
			}

			//This Sucks, but it works!
			if (!loop) {
				lastMessage = await sendMethod({
					content: `${originalMessage ? `${AUTH_POST} ${originalMessage}` : `${ORIG_MESSAGE} ${message.author}`}`,
					embeds: embeds.map((e) => e),
				});
			} else {
				lastMessage = await sendMethod({ embeds: embeds.map((e) => e) });
			}
		}

		//Video Only
		if (tweetData.tweet.video_url) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `@${tweetData.user.screen_name}`, url: `https://twitter.com/${tweetData.user.screen_name}` })
				.setTitle(tweetData.user.name)
				.setURL(tweetData.tweet.url)
				.setThumbnail(tweetData.user.profile_image_url)
				.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
				.setFooter({ text: message.member.displayName, iconURL: message.member.displayAvatarURL() })
				.setTimestamp()
				.setColor(settings.guildcolor);
			const attachment = new MessageAttachment(tweetData.tweet.video_url, `media.mp4`);

			if (!loop) {
				lastMessage = await sendMethod({
					content: `${originalMessage ? `${AUTH_POST} ${originalMessage}` : `${ORIG_MESSAGE} ${message.author}`}`,
					embeds: [embed],
					files: [attachment],
				});
			} else {
				lastMessage = await sendMethod({ embeds: [embed], files: [attachment] });
			}
		}

		//Set Variables
		MESSAGES.push(lastMessage);
		lastMessage = lastMessage;
		originalMessage = null;
		loop = true;
	}
}
