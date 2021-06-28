const { DevMode } = require('../../Storage/Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');

module.exports = {
	name: 'ready',
	disabled: false,
	once: true,
	async execute(bot) {
		bot.guilds.cache.map((guild) => {
			table.addRow(`${guild.name}`, '✔ » Connected');
		});
		console.log(table.toString());
		bot.StartedAt = Date.now();

		if (DevMode === true) {
			bot.user.setPresence({ activity: { name: '«Dev Mode Enabled»' }, status: 'online' });
		}
	},
};
