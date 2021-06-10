module.exports = {
	name: 'guildCreate',
	disabled: false,
	once: false,
	async execute(guild, bot) {
		try {

			const data = [];
			await guild.channels.cache.filter(ch => ch.type === 'category').filter(x => x !== undefined).sort((a, b)=> a.position - b.position).map(categories => {
				const children = categories.children.filter(ch => ch.type === 'text').filter(x => x !== undefined);

				data.push(
					{ category: categories.name, channels: [children.map(child => {
						if(child.type === 'text') {
							return { name: child.name, id: child.id } ;
						}
					})] },
				);

			});
			const final = [...new Set(data)];

			const newGuild = {
				guildcolor: `#${ Math.floor(Math.random() * 16777215).toString(16) }`,
				guildid: guild.id,
				guildname: guild.name,
				channels: final,
			};

			const newReaction = {
				guildid: guild.id,
				guildname: guild.name,
			};

			await bot.createGuild(newGuild);
			await bot.createReactions(newReaction);

		}
		catch (error) {
			console.error(error);
		}
	},
};