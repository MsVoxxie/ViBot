const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
module.exports = {
	name: 'inspire',
	aliases: [],
	description: 'Generate an "Inspirational" quote!',
	example: 'inspire',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const randomQuip = [
			'*Getcha Head In The Game*',
			'*Believe In The Me That Believes In Vi*',
			'*Feel The Inspiration*',
			'*Are you inspired yet?*',
			'*You sure like these, huh?*',
			'*Pls Rember 2 Smile Wen U Fel Scare*',
			'*Where am I?*',
			'*Please get me out of here...*',
			'*How did I get here...?*',
			'*Funfact: Vi means Six in roman numerals*',
		];

		// Send loading message...
		const loading = await message.reply(`${Vimotes['A_LOADING']}Generating Inspirational Quotes...`);

		// Promise based function to get an image from inspirobot's api.
		const res = await fetch('http://inspirobot.me/api?generate=true');
		const body = await res.text();
		try {
			const QuoteEmbed = new MessageEmbed()
				.setAuthor({ name: `${message.member.displayName}'s Quote`, iconURL: message.member.user.displayAvatarURL({ dynamic: true })})
				.setDescription(`${randomQuip[Math.floor(Math.random() * randomQuip.length)]}`)
				.setImage(body)
				.setColor(settings.guildcolor)
				.setFooter({ text: bot.Timestamp(new Date()) });
			await loading.edit({ content: null, embeds: [QuoteEmbed] });
		} catch (e) {
			await loading.edit({ content: 'Failed to Inspire you.' }).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}
	},
};
