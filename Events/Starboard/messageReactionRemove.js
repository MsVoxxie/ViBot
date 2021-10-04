const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageReactionRemove',
	disabled: false,
	once: false,
	async execute(reaction, user, bot, Vimotes) {
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}
		//Define Message for sanity, Get settings.
		const message = await reaction.message;
		const settings = await bot.getGuild(message.guild);

		//Checks
		if (reaction.emoji.name !== '⭐') return;
		// if (message.author.id === user.id) return;
		if (message.author.bot) return;

		//get starchannel
		const starChannelID = await settings.starchannel;
		const starChannel = await message.guild.channels.cache.get(starChannelID);
		if (!starChannel) return;

		const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
		const stars = fetchedMessages.find(
			(m) =>
				m.embeds[0].footer.text.startsWith('⭐') &&
				m.embeds[0].footer.text.endsWith(reaction.message.id)
		);

		if (stars) {
			const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
			const foundStar = stars.embeds[0];
			const image =
				message.attachments.size > 0
					? await this.extension(reaction, message.attachments.first().url)
					: '';

			const embed = new MessageEmbed()
				.setColor(foundStar.color)
				.setDescription(
					foundStar.description != 'null' || foundStar != null ? foundStar.description : ''
				)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp()
				.setFooter(`⭐ ${parseInt(star[1]) - 1} | ${message.id}`)
				.setImage(image);
			const starMsg = await starChannel.messages.fetch(stars.id);
			await starMsg.edit({ embeds: [embed] });
			if (parseInt(star[1]) - 1 == 0) return setTimeout(() => starMsg.delete(), 1 * 1000);
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
