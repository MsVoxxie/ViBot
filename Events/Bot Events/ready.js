const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');

module.exports = {
	name: 'ready',
	disabled: false,
	once: false,
	async execute(bot) {
		bot.guilds.cache.forEach((f) => {
			table.addRow(`${f.name}`, '✔ » Connected');
		});
		console.log(table.toString());
		bot.StartedAt = Date.now();
	},
};