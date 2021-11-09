const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'birthday',
	aliases: ['bday'],
	description: 'Add your birthday!',
	example: '',
	category: 'birthday',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Check if birthday already exists
		let doesExist;
		const Bdays = await bot.getBirthdays(message.guild);
		const Users = Bdays.birthdays;
		await Users.map(async (ID) => {
			if (ID.userid === message.author.id) {
				message.channel.send(`You already have a birthday set!`).then((m) => setTimeout(() => m.delete(), 5 * 1000));
				doesExist = true;
			} else {
				doesExist = false;
			}
		});

		if (doesExist === true) return;

		//Define Variables
		let EmbedID = undefined;
		let BirthDate;

		//Setup Filter
		const filter = (m) => m.author.id === message.author.id;

		// Questions
		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, 'Whats your birthday?', 'Please use Numerical Dates EG: MM/DD/YYYY\n Christmas Day would be: 12/25/2021', false);
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			BirthDate = await Date.parse(collected.first().cleanContent).toLocaleString('en', { dateStyle: 'short' }).replace(/,/g, '');
			setTimeout(() => collected.first().delete(), 5 * 1000);
		});

		await bot.addBirthday(message.guild, { userid: message.member.id, username: message.member.user.tag, birthday: BirthDate, sent: false });

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, 'Awesome!', `Added your birthday! 🎂`, true);
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			BirthDate = await Date.parse(collected.first().cleanContent);
			setTimeout(() => collected.first().delete(), 5 * 1000);
		});
	},
};

//Embed Function
async function GenerateEmbed(guildColor, msg, EmbedID, Title, Question, Delete) {
	let m;

	const embed = new MessageEmbed()
		.setAuthor(`${msg.member.displayName}`, msg.member.displayAvatarURL({ dynamic: true }))
		.setColor(guildColor)
		.setTitle(Title)
		.setDescription(Question)
		.setTimestamp();

	if (EmbedID === undefined) {
		m = await msg.channel.send({ embeds: [embed] });
		if (Delete === true) {
			setTimeout(() => m.delete(), 30 * 1000);
			setTimeout(() => msg.delete(), 30 * 1000);
		}
		EmbedID = m.id;
	} else {
		const emb = await msg.channel.messages.fetch(EmbedID);
		m = await emb.edit({ embeds: [embed] });
		if (Delete === true) {
			setTimeout(() => m.delete(), 30 * 1000);
			setTimeout(() => msg.delete(), 30 * 1000);
		}
	}
	return m.id;
}
