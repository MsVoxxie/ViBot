const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'enlarge',
	aliases: ['en'],
	description: 'Get the full size of an emoji',
	example: 'en 😄',
	category: 'utilit',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// Declarations
		let type;

		// Split Emoji into pieces
		const CutFront = args[0].replace('<', '');
		const CutBack = CutFront.replace('>', '');
		const Slice = CutBack.split(':');
		if (Slice.includes('a')) {
			type = '.gif';
		}
		else {
			type = '.png';
		}

		const Emoji = `https://cdn.discordapp.com/emojis/${Slice[2]}${type}?v=1`;
		if (Emoji) {
			try {
				const embed = new MessageEmbed()
					.setColor(settings.color)
					.setImage(Emoji)
					.setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
					.setFooter(`Emoji Enlarged› ${args.join(' ')}`);
				message.channel.send({ embed: embed });
			}
			catch (e) {
				console.log(e);
			}
		}
		else {
			return message.lineReply('Please provide a valid Emoji to enlarge.').then(s => s.delete({ timeout: 10 * 1000 }));
		}
	},
};