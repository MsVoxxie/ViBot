const mongoose = require('mongoose');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');
const { DevMode } = require('../../Storage/Config/Config.json');

module.exports = {
	name: 'ready',
	disabled: false,
	once: true,
	async execute(bot) {
		//Init Mongoose
		try {
			await mongoose.connection.close();
			await bot.mongoose.init();
		} catch (e) {
			console.error(e);
		}

		await bot.sleep(1000);

		//Set the bot status and stats
		bot.guilds.cache.map((guild) => {
			table.addRow(`${guild.name}`, '✔ » Connected');
		});
		console.log(table.toString());
		bot.StartedAt = Date.now();
		bot.updateBotData(bot);

		if (DevMode === true) {
			await bot.user.setPresence({ activities: [{ name: '«Dev Mode Enabled»' }], status: 'online' });
		} else {
			await bot.user.setPresence({
				activities: [
					{
						type: 'WATCHING',
						name: `for commands!`,
					},
				],
				status: 'online',
			});
		}
	},
};
