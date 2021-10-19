const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'raffle',
	aliases: ['giveaway', 'raf'],
	description: 'Start a raffle!',
	example: "raffle",
	category: 'raffles',
	args: false,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		// Declarations
		let EmbedID = undefined;
		let Channel;
		let Time;
		let WinnerCount;
		let Prize;

		//Setup Filter
		const filter = (m) => m.author.id === message.author.id;

		// Questions

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, "Which channel?", "Which channel would you like the raffle to be posted in?\n Use #channel-name", false)
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			const chan = await collected.first().mentions.channels.first();
			if (!chan) return message.reply(`This isn't a channel! Cancelling command.`).then((s) => {
				if (settings.prune) {
					setTimeout(() => s.delete(), 30 * 1000)
					setTimeout(() => collected.first().delete(), 5 * 1000)
				}
			});
			Channel = chan;
			setTimeout(() => collected.first().delete(), 5 * 1000)
		})

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, "How long?", "How long should the raffle run for?\n Use short form, such as `1d`", false)
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			const time = collected.first().cleanContent;
			Time = time;
			setTimeout(() => collected.first().delete(), 5 * 1000)
		})

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, "How many?", "How many winners should the raffle have?\n Simply provide a numeric number.", false)
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			const count = parseInt(collected.first().cleanContent)
			if (!count) return message.reply(`This isn't a number`).then((s) => {
				if (settings.prune) {
					setTimeout(() => s.delete(), 30 * 1000)
					setTimeout(() => collected.first().delete(), 5 * 1000)
				}
			});
			WinnerCount = count;
			setTimeout(() => collected.first().delete(), 5 * 1000)
		})

		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, "What are you giving away?", "What is the prize?", false)
		await message.channel.awaitMessages({ filter, max: 1, time: 360 * 1000, error: ['time'] }).then(async (collected) => {
			Prize = collected.first().cleanContent;
			setTimeout(() => collected.first().delete(), 5 * 1000)
		})


		EmbedID = await GenerateEmbed(settings.guildcolor, message, EmbedID, "All Done!", `Creating your raffle!\n**Channel›** ${Channel.name}\n**Run Time›** ${ms(Time, { long: true })}\n**Number of Winners›** ${WinnerCount}\n**Prize›** ${Prize}`, true)
		await bot.RaffleManager.start(Channel, {
			duration: ms(Time),
			prize: Prize,
			winnerCount: WinnerCount,
			embedColor: settings.guildcolor,
			messages: {
				giveaway: '🗳️ 🗳️ **Raffle Started** 🗳️ 🗳️',
				giveawayEnded: '⚠️ ⚠️ **Raffle Ended** ⚠️ ⚠️',
				drawing: 'Drawing: {timestamp}',
				dropMessage: 'Be the first to react with 🗳️ !',
				inviteToParticipate: 'React with 🗳️ to participate!',
				winMessage: 'Congratulations, {winners}!\nYou Won **{this.prize}**!',
				embedFooter: '{this.winnerCount} winner(s)',
				noWinner: 'Raffle cancelled, no valid participations.',
				hostedBy: 'Hosted by: {this.hostedBy}',
				winners: 'Winner(s):',
				endedAt: 'Ended at',
			},
			lastChance: {
				enabled: true,
				content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
				threshold: 5000,
				embedColor: '#FF0000'
			}
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
		m = await msg.channel.send({ embeds: [embed] })
		if (Delete === true) {
			setTimeout(() => m.delete(), 30 * 1000)
			setTimeout(() => msg.delete(), 30 * 1000)
		}
		EmbedID = m.id;
	} else {
		const emb = await msg.channel.messages.fetch(EmbedID);
		m = await emb.edit({ embeds: [embed] })
		if (Delete === true) {
			setTimeout(() => m.delete(), 30 * 1000)
			setTimeout(() => msg.delete(), 30 * 1000)
		}
	}
	return m.id;
}