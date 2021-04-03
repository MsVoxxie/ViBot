const { bot } = require('../Vi');
bot.on('guildCreate', async guild => {
	try {
		const newGuild = {
			guildID: guild.id,
			guildName: guild.name,
		};
		await bot.createGuild(newGuild);
	}
	catch (error) {
		console.error(error);
	}
});