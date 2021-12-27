const { MessageEmbed } = require('discord.js');

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
		const stars = fetchedMessages.find((msg) => msg.embeds[0].footer.text.includes(`MessageID: ${message.id}`));

		if (stars) {
			// return console.log(stars.content)
			const star = /(?!⭐|✨|🌟|💫\s?)\d+/.exec(stars.content);
			const embed = new MessageEmbed()
				.setColor('#c2b04e')
                .setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
                .setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
				.setFooter(`MessageID: ${message.id}`);

			const starMsg = await starChannel.messages.fetch(stars.id);
			await starMsg.edit({ content: `${randStar} ${parseInt(star[0]) - 1} | <#${message.channel.id}>`, embeds: [embed] });
            if (parseInt(star[0]) - 1 <= ReactLimit) return setTimeout(() => starMsg.delete(), 1 * 3000);
		}
	},

	//Functions
	imageAttachment(message) {
		const imageLink = message.attachments.first().url.split('.')
		const typeOfImage = imageLink[imageLink.length - 1];
		const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
		if (!image) return '';
		return message.attachments.first().url;
	},

	imageURL(message) {
		let imgRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/.exec(message.content);
		return imgRegex;
	}
};