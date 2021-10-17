const ms = require('ms');

module.exports = {
	name: 'raffle',
	aliases: ['giveaway', 'raf'],
	description: 'Start a raffle!',
	example: "raffle 2d 1 A big ol'l Hug!",
	category: 'raffles',
	args: true,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		// Declarations
		const Time = args[0];
		const WinnerCount = parseInt(args[1]);
		const Prize = args.slice(2).join(' ');

		// Checks
		if (!Time)
			return message.reply('\nPlease provide a duration for the raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!WinnerCount || isNaN(WinnerCount))
			return message.reply('\nPlease provide the number of winners for this raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!Prize)
			return message.reply('\nPlease provide a prize for the raffle.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});

		console.log(Time);
		// Do the raffle
		bot.RaffleManager.start(message.channel, {
			duration: ms(Time),
			prize: Prize,
			winnerCount: WinnerCount,
		});
	},
};
