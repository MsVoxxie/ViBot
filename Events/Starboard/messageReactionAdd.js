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

		//get starchannel
		const starChannelID = await settings.starchannel;
		const starChannel = await message.guild.channels.cache.get(starChannelID);
		if (!starChannel) return;

		//Fetch messages
		const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
		const stars = fetchedMessages.find(
			(m) =>
				m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id)
		);

		//Setup starboard
		if (stars) {
			const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
			const foundStar = stars.embeds[0];
			const image =
				message.attachments.size > 0
					? await this.extension(reaction, message.attachments.first().url)
					: '';

			const embed = new MessageEmbed()
				.setColor(foundStar.color)
				.setDescription(foundStar.description)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp()
				.setFooter(`⭐ ${parseInt(star[1]) + 1} | ${message.id}`)
				.setImage(image);

			const starMsg = await starChannel.messages.fetch(stars.id);
			await starMsg.edit({ embeds: [embed] });
		}

		if (!stars && reaction.emoji.name === '⭐' && reaction.count >= ReactLimit) {
			// Check for attachments
			const image =
				message.attachments.size > 0
					? await this.extension(reaction, message.attachments.first().url)
					: '';

			// Check if the messages is empty.
			if (image === '' && message.cleanContent.length < 1)
				return message.channel.send(`${user}, you cannot star an empty message.`);

			const embed = new MessageEmbed()
				.setColor(15844367)
				.setDescription(message.cleanContent)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp(new Date())
				.setFooter(`⭐ ${ReactLimit} | ${message.id}`)
				.setImage(image);

			await starChannel.send({ embeds: [embed] });
		}
	},

	extension(reaction, attachment) {
		const imageLink = attachment.split('.');
		const typeOfImage = imageLink[imageLink.length - 1];
		const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
		if (!image) return '';
		return attachment;
	},
};
