module.exports = {
	name: 'guildCreate',
	disabled: false,
	once: false,
	async execute(guild, bot) {
		try {
			const newGuild = {
				guildcolor: `#${ Math.floor(Math.random() * 16777215).toString(16) }`,
				guildid: guild.id,
				guildname: guild.name,
			};
			await bot.createGuild(newGuild);
		}
		catch (error) {
			console.error(error);
		}
	},
};

