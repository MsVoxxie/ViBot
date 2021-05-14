module.exports = {
	name: 'guildCreate',
	disabled: false,
	once: false,
	async execute(guild, bot) {
		try {
			const newGuild = {
				guildColor: `#${ Math.floor(Math.random() * 16777215).toString(16) }`,
				guildID: guild.id,
				guildName: guild.name,
			};
			await bot.createGuild(newGuild);
		}
		catch (error) {
			console.error(error);
		}
	},
};

