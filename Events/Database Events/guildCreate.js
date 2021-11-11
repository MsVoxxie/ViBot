module.exports = {
	name: 'guildCreate',
	disabled: false,
	once: false,
	async execute(guild, bot) {
		try {
			//Setup Dashboard Channels
			const data = [];
			await guild.channels.cache
				.filter((ch) => ch.type === 'category')
				.filter((x) => x !== undefined)
				.sort((a, b) => a.position - b.position)
				.map((categories) => {
					const children = categories.children.filter((ch) => ch.type === 'text').filter((x) => x !== undefined);

					data.push({
						category: categories.name,
						channels: [
							children.map((child) => {
								if (child.type === 'text') {
									return { name: child.name, id: child.id };
								}
							}),
						],
					});
				});
			//Save Channels and Categories as a non duplicating array
			const final = [...new Set(data)];

			await bot.createGuild({ guildcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, guildid: guild.id, guildname: guild.name, channels: final });
			await bot.createReactions({ guildid: guild.id, guildname: guild.name });
			await bot.createBirthdays({ guildid: guild.id, guildname: guild.name });
			await bot.createTwitchWatch({ guildid: guild.id, guildname: guild.name });
		} catch (error) {
			console.error(error);
		}
	},
};
