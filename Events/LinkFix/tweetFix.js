const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

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
		const Mode = 'Automatic'; // 'Automatic' or 'Manual'
		const RegEx = /((https?):\/\/)?(www.)?(|sx|ayy|vx)tw(i|x)tter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}\S{0,30}/gi;
		const Matches = [...message.content.matchAll(RegEx)];
		const settings = await bot.getGuild(message.guild);

		//Statics
		const ORIG_MESSAGE = '**Originally Posted By›** ';
		const AUTH_POST = `**${message.author}›** `;

		//Variables
		let lastMessage = null;
		let loop = false;

		//Check if Message is a Tweet
		if (!Matches.length) return;

		switch (Mode) {
			case 'Automatic':
				//Get original message without links
				let originalMessage = message.content;
				Matches.forEach((match) => {
					originalMessage = originalMessage.replace(match[0], '').trim();
				});

				//TryCatch in case of error..
				try {
					//Setup Variables to send to function and then run function
					const funcData = { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop };
					await sendTweets(funcData);

					//Delete Original Message
					await message.delete();
				} catch (err) {
					console.error(err);
					return;
				}
				break;

			case 'Manual':
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
						originalMessage = originalMessage.replace(match[0], '').trim();
					});

					//TryCatch in case of error..
					try {
						//Setup Variables to send to function and then run function
						const funcData = { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop };
						await sendTweets(funcData);

						//Delete Original Message
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
	let { ORIG_MESSAGE, AUTH_POST, Matches, message, bot, settings, lastMessage, originalMessage, loop } = funcData;

	//Loop through Matches
	for await (const Match of Matches) {
		//Remove first reaction and add loading emoji...
		await message.reactions?.removeAll();

		//Wait to not overload the API
		await bot.sleep(500);

		//Get Media
		const tweetData = await bot.getTwitterMedia(Match[0]);

		//Send Method
		const sendMethod = (data) => (lastMessage !== null ? lastMessage.reply(data) : message.channel.send(data));

		//Make the lines pretty :)
		const intData = `♥️ [${bot.toThousands(tweetData.tweet.likes)}] 🔃 [${bot.toThousands(tweetData.tweet.retweets)}]`;
		const wrapLines = '─'.repeat(bot.MinMax(intData.length / 1.5, 1, 18));

		//Create Embed
		const embeds = [];

		//Text Only
		if (tweetData.tweet.description && !tweetData.tweet.media_urls && !tweetData.tweet.video_url) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `@${tweetData.user.screen_name}` })
				.setTitle(tweetData.user.name)
				.setURL(tweetData.tweet.url)
				.setThumbnail(tweetData.user.profile_image_url)
				.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
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
					.setAuthor({ name: `@${tweetData.user.screen_name}` })
					.setTitle(tweetData.user.name)
					.setURL(tweetData.tweet.url)
					.setThumbnail(tweetData.user.profile_image_url)
					.setImage(tweetData.tweet.video_url ? null : photo)
					.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
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
				.setAuthor({ name: `@${tweetData.user.screen_name}` })
				.setTitle(tweetData.user.name)
				.setURL(tweetData.tweet.url)
				.setThumbnail(tweetData.user.profile_image_url)
				.setDescription(`${tweetData.tweet.description}\n${wrapLines}\n${intData}\n${wrapLines}`)
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
		lastMessage = lastMessage;
		originalMessage = null;
		loop = true;
	}
}
