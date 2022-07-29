module.exports = {
	name: 'ready',
	disabled: false,
	once: false,
	async execute(bot, Vimotes) {
		await bot.twitterStream();
	},
};
