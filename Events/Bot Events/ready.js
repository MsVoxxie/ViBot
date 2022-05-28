const { BotData } = require('../../Storage/Database/models/index.js');
const { DevMode } = require('../../Storage/Config/Config.json');
const ascii = require('ascii-table');
const mongoose = require('mongoose');
const table = new ascii().setHeading('Servers', 'Connection Status');

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

		//Bot Data
		bot.StartedAt = Date.now();
		bot.updateBotData(bot);

		//If the bot was restarted, update the message.
		const currentState = await BotData.find({}).lean();
		const data = currentState[0].restartdata;
		if (data.restarted === true) {
			const g = await bot.guilds.fetch(data.guild);
			const c = await g.channels.fetch(data.channel);
			const m = await c.messages.fetch(data.message);

			//Get time it took
			const difference = Date.now() - m.createdTimestamp;
			await m.edit(`✅ Restarted in ***\`${Math.round(difference / 1000)}\`*** seconds.`);

			//Reset restart data
			await BotData.findOneAndUpdate({}, { restartdata: { restarted: false } }, { upsert: true, new: true });
		}

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
