const ascii = require('ascii-table');
const table = new ascii().setHeading('Servers', 'Connection Status');

module.exports = {
	name: 'ready',
	disabled: false,
	once: true,
	async execute(bot) {
		bot.guilds.cache.map(guild => {
			table.addRow(`${guild.name}`, '✔ » Connected');
		});
		console.log(table.toString());
		bot.StartedAt = Date.now();
		// cacheReactionData(bot);
	},
};

// async function cacheReactionData(bot) {
// 	bot.guilds.cache.forEach(async guild => {
// 		const data = await bot.getReactions(guild);
// 		const roles = await data.reactionRoles;
// 		roles.forEach(async gdata => {
// 			const channel = await guild.channels.cache.get(gdata.channel);
// 			const msg = await channel.messages.fetch(gdata.message);
// 		});
// 	});
// }