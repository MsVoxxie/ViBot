module.exports = {
	name: 'ready',
	disabled: true,
	once: false,
	async execute(bot, Vimotes) {
		await bot.twitterStream();
	},
};
