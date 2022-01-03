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
		//Check if arguments are provided.
		if (args.length)
			return message.channel.send('Please simply type out the command and answer my prompt.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 15 * 1000);
			});

		//Check if birthday already exists
		var date_regex = /^(0?[1-9]|1[0-2]){1}\/(0?[1-9]|1[0-9]|2[0-9]|3[0-1]){1}$/;
		const Bdays = await bot.getBirthdays(message.guild);
		const Users = Bdays.birthdays;

		const BdayCheck = await Users.find((ID) => ID.userid === message.author.id);
		if (BdayCheck)
			return message.channel.send(`You already have a birthday set!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 15 * 1000);
			});

		//Define Variables
		let EmbedID = undefined;
		let BirthDate;
		let dateValid = true;
		let cmdFailed = false;

		//Setup Filter
		const filter = (m) => m.author.id === message.author.id;

		// Questions
		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, 'Whats your birthday?', 'Please use Numerical Dates EG: MM/DD\n Christmas Day would be: 12/25', false);
		await message.channel.awaitMessages({ filter, max: 1, time: 30 * 1000, error: ['time'] }).then(async (collected) => {
			if (!date_regex.test(collected.first().cleanContent)) {
				await message.reply('Invalid Date, Cancelling!').then((m) => {
					setTimeout(() => m.delete(), 30 * 1000);
					dateValid = false;
				});
			}
			BirthDate = await Date.parse(collected.first().cleanContent).toLocaleString('en', { dateStyle: 'short' }).replace(/,/g, '');
			setTimeout(() => collected.first().delete(), 15 * 1000);
		}).catch(err => {
			cmdFailed = true;
			return message.reply('You took too long to respond! Cancelling!').then((m) => {
				setTimeout(() => m.delete(), 30 * 1000);
			});
		})

		if(cmdFailed) {
			const emsg = await message.channel.messages.fetch(EmbedID);
			await emsg.delete();
			return;
		}

		if (!dateValid) {
			const emsg = await message.channel.messages.fetch(EmbedID);
			await emsg.delete();
			return;
		}

		await bot.addBirthday(message.guild, { userid: message.member.id, username: message.member.user.tag, birthday: BirthDate, sent: false });

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, 'Awesome!', `Added your birthday! 🎂`, true);
		await message.channel.awaitMessages({ filter, max: 1, time: 60 * 1000, error: ['time'] }).then(async (collected) => {
			BirthDate = await Date.parse(collected.first().cleanContent);
			setTimeout(() => collected.first().delete(), 15 * 1000);
		});
	},
};

//Embed Function
async function GenerateEmbed(guildColor, msg, EmbedID, Title, Question, Delete) {
	let m;

	const embed = new MessageEmbed()
		.setAuthor({ name: msg.member.displayName, iconURL: msg.member.displayAvatarURL({ dynamic: true })})
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
