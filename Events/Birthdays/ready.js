const cron = require('node-cron');
module.exports = {
	name: 'ready',
	disabled: false,
	once: true,
	async execute(bot, Vimotes) {
		await cron.schedule('0 8 * * *', async () => {
			await bot.checkBirthdays();
		});
		console.log('Birthday Check Scheduled for 8 am daily.');
	},
};
