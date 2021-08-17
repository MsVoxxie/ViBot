const ms = require('ms');

module.exports = {
	name: 'raffle',
	aliases: ['giveaway', 'raf'],
	description: 'Start a raffle!',
	example: "2d 1 A big ol'l Hug!",
	category: 'raffles',
	args: true,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		// Declarations
		const Time = ms(args[0]);
		const WinnerCount = parseInt(args[1]);
		const Prize = args.slice(2).join(' ');

		// Checks
		if (!Time)
			return message.lineReply('\nPlease provide a duration for the raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!WinnerCount || isNaN(WinnerCount))
			return message.lineReply('\nPlease provide the number of winners for this raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!Prize)
			return message.lineReply('\nPlease provide a prize for the raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});

		// Do the raffle
		bot.RaffleManager.start(message.channel, {
			time: Time,
			prize: Prize,
			winnerCount: WinnerCount,
			messages: {
				giveaway: `🗳️ **<@!${message.member.id}> Started a Raffle!** 🗳️`,
				giveawayEnded: `🗳️ **<@!${message.member.id}>'s Giveaway Ended!** 🗳️`,
				timeRemaining: 'Time remaining: **{duration}**!',
				inviteToParticipate: 'React with 🗳️ to participate!',
				winMessage: 'Congratulations, {winners}! You won **{prize}**!',
				embedFooter: 'Good luck everyone!',
				noWinner: 'Raffle cancelled, no valid participations.',
				hostedBy: 'Hosted by: {user}',
				winners: 'winner(s)',
				endedAt: 'Ended at',
				units: {
					seconds: 'seconds',
					minutes: 'minutes',
					hours: 'hours',
					days: 'days',
				},
			},
		});
	},
};
