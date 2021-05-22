const { MessageEmbed } = require('discord.js');
const request = require('request');

module.exports = {
	name: 'inspire',
	aliases: [],
	description: 'Generate an "Inspirational" quote!',
	example: '',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {

		// Define number for loop
		let num;

		if (args[0] && !isNaN(args[0]) && args[0] > 0) {
			num = Math.floor(args[0]);
		}
		else {
			num = 1;
		}

		const randomQuip = [
			'*Getcha Head In The Game*',
			'*Believe In The You That Believes In Chi*',
			'*Feel The Inspiration*',
			'*Are you inspired yet?*',
			'*You sure like these, huh?*',
			'*Pls Rember 2 Smile Wen U Fel Scare*',
			'*Where am I?*',
			'*Please get me out of here...*',
			'*How did I get here...?*',
			'*Funfact: Vi Six in roman numerals*',
		];

		// Promise based function to get an image from inspirobot's api.
		async function generateInspirationalQuote(number) {
			request('http://inspirobot.me/api?generate=true', async (error, response, body) => {
				const QuoteEmbed = new MessageEmbed()
					.setAuthor(`${message.member.displayName}'s Quote`, `${message.member.user.displayAvatarURL({ dynamic: true })}`)
					.setDescription(`${randomQuip[Math.floor(Math.random() * randomQuip.length)]}`)
					.setImage(body)
					.setColor(settings.guildcolor)
					.setFooter(bot.Timestamp(new Date()));
				await message.channel.send({ embed: QuoteEmbed });
			});
		}

		// Sanity Check
		if (num > 5) {
			return message.lineReply('Maximum of 5 please!');
		}

		for (let step = 0; step < num; step++) {
			await generateInspirationalQuote(step);
		}
	},
};