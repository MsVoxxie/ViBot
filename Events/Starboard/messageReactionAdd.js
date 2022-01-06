const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageReactionAdd',
	disabled: false,
	once: false,
	async execute(reaction, user, bot, Vimotes) {
		//Check if message was partial, if so fetch it.
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}
		//Defininitions
		const message = await reaction.message;
		const ReactLimit = 5;
		const settings = await bot.getGuild(message.guild);

		//Checks
		if (reaction.emoji.name !== '⭐') return;
		// if (message.author.id === user.id) return;
		if (message.author.bot) return;

		//Random Star!
		const starEmojis = ['💫', '⭐', '🌟', '✨'];
		const randStar = starEmojis[Math.floor(Math.random() * starEmojis.length)];

		//get starchannel
		const starChannelID = await settings.starchannel;
		const starChannel = await message.guild.channels.cache.get(starChannelID);
		if (!starChannel) return;

		//Fetch messages
		const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
		const stars = await fetchedMessages.find((msg) => (msg.emebds != undefined ? msg.embeds[0].footer.text.includes(`MessageID: ${message.id}`) : null));

		if (stars) {
			// return console.log(stars.content)
			const star = /(?!⭐|✨|🌟|💫\s?)\d+/.exec(stars.content);
			const embed = new MessageEmbed()
				.setColor('#c2b04e')
				.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
				.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
				.setFooter({ text: `MessageID: ${message.id}` });

			const starMsg = await starChannel.messages.fetch(stars.id);
			await starMsg.edit({ content: `${randStar} ${parseInt(star[0]) + 1} | <#${message.channel.id}>`, embeds: [embed] });
		} else if (!stars && reaction.emoji.name === '⭐' && reaction.count >= ReactLimit) {
			//Check for Images or URL's
			const imageAt = (await message.attachments.size) > 0 ? await this.imageAttachment(message) : '';
			const imgLink = (await message.content) ? this.imageURL(message) : '';
			const finalImage = imageAt ? imageAt : imgLink ? imgLink[0] : '';

			// Check if the messages is empty.
			if (finalImage === '' && message.content.length < 1)
				return message.reply(`You cannot star an empty message.`).then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
				});

			const embed = new MessageEmbed()
				.setColor('#c2b04e')
				.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
				.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
				.setImage(finalImage)
				.setFooter({ text: `MessageID: ${message.id}` });
			await starChannel.send({ content: `${randStar} ${ReactLimit} | <#${message.channel.id}>`, embeds: [embed] });
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
