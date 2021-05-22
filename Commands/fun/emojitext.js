const { MessageEmbed } = require('discord.js');
const emojitext = require('../../Storage/Functions/texttoemoji');

module.exports = {
	name: 'texttoemoji',
	aliases: ['tte'],
	description: 'Emojify your text!',
	example: 'hee hoo',
	category: 'fun',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {

		// Convert text
		const emoji = function(text) {
			return text.split('').map(function(a) {
				return emojitext.hasOwnProperty(a) ? emojitext[a] : a;
			}).join(' ');
		};

		// Set up embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor(message.member.displayName, message.author.displayAvatarURL())
			.setDescription(emoji(args.join(' ').toLowerCase()));
		return message.channel.send({ embed: embed });
	},

};