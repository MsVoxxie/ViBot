const { MessageEmbed } = require('discord.js');
const request = require('request');

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
			'*Believe In The You That Believes In Chi*',
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
		async function generateInspirationalQuote(number, loadingMessage) {
			request('http://inspirobot.me/api?generate=true', async (error, response, body) => {
				const QuoteEmbed = new MessageEmbed()
					.setAuthor(`${message.member.displayName}'s Quote`, `${message.member.user.displayAvatarURL({ dynamic: true })}`)
					.setDescription(`${randomQuip[Math.floor(Math.random() * randomQuip.length)]}`)
					.setImage(body)
					.setColor(settings.guildcolor)
					.setFooter(bot.Timestamp(new Date()));
				await loadingMessage.edit('', { embeds: QuoteEmbed });
			});
		}

		await generateInspirationalQuote(1, loading);
	},
};