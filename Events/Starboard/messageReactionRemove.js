const { Starboard } = require('../../Storage/Database/models/');
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
		const settings = await bot.getGuild(message.guild);
		let StarData;

		//Checks
		if (reaction.emoji.name !== '⭐') return;
		// if (message.author.id === user.id) return;
		if (message.author.bot) return;

		//Random Star!
		const starEmojis = ['💫', '⭐', '🌟', '✨'];
		const randStar = starEmojis[Math.floor(Math.random() * starEmojis.length)];

		//Get Counts
		const ReactLimit = 5;
		const starCount = await message.reactions.cache.get('⭐').count;

		//get starchannel
		const starChannelID = await settings.starchannel;
		const starChannel = await message.guild.channels.cache.get(starChannelID);
		if (!starChannel) return;

		//Check if message is already starred
		const ExistingStar = await Starboard.findOne({ guildid: message.guild.id, messageid: message.id });

		//If message is already starred, update star count
		if (ExistingStar) {
			StarData = await Starboard.findOneAndUpdate({ guildid: message.guild.id, messageid: message.id }, { $set: { starcount: starCount } }, { new: true, upsert: true });
		} else {
			//If message is not starred, create new star
			StarData = await Starboard.findOneAndUpdate(
				{ guildid: message.guild.id, authorid: message.author.id, messageid: message.id, channelid: message.channel.id },
				{ $set: { guildid: message.guild.id, messageid: message.id, starcount: starCount, starred: false } },
				{ new: true, upsert: true }
			);
		}

		//Check for Images or URL's
		const imageAt = (await message.attachments.size) > 0 ? await this.imageAttachment(message) : '';
		const imgLink = (await message.content) ? this.imageURL(message) : '';
		const finalImage = imageAt ? imageAt : imgLink ? imgLink[0] : '';

		// Check if the messages is empty.
		if (finalImage === '' && message.content.length < 1)
			return message.reply(`You cannot star an empty message.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		//Embed
		const embed = new MessageEmbed()
			.setColor('#c2b04e')
			.setDescription(`${message.content}\n\n[Click to jump to message](${message.url})\nStarred› ${bot.relativeTimestamp(Date.now())}`)
			.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
			.setImage(finalImage)
			.setFooter({ text: `MessageID: ${message.id}` });

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
			await Message.edit({ content: `${randStar} ${StarData.starcount} | <#${message.channel.id}>`, embeds: [embed] });
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
