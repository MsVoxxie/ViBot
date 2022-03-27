const mongoose = require('mongoose');
const { DevMode } = require('../../Storage/Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');

module.exports = {
	name: 'ready',
	disabled: false,
	once: true,
	async execute(bot) {
		//Set the bot status and stats
		bot.guilds.cache.map((guild) => {
			table.addRow(`${guild.name}`, '✔ » Connected');
		});
		console.log(table.toString());
		bot.StartedAt = Date.now();
		bot.updateBotData(bot);

		if (DevMode === true) {
			bot.user.setPresence({ activity: { name: '«Dev Mode Enabled»' }, status: 'online' });
		}

		//Init Mongoose
		try {
			await mongoose.connection.close();
			await bot.mongoose.init();
		} catch (e) {
			console.error(e);
		}
		
	},
};
