module.exports = {
	name: 'channelCreate',
	disabled: false,
	once: false,
	async execute(chan, bot) {
		if (!chan) return;
		const channel = await chan.guild.channels.cache.get(chan.id);

		const data = [];
		await channel.guild.channels.cache
			.filter((ch) => ch.type === 'GUILD_CATEGORY')
			.filter((x) => x !== undefined)
			.sort((a, b) => a.position - b.position)
			.map((categories) => {
				const children = categories.children.filter((ch) => ch.type === 'GUILD_TEXT' || ch.type === 'GUILD_NEWS').filter((x) => x !== undefined);

				data.push({
					category: categories.name,
					channels: [
						children.map((child) => {
							if (child.type === 'GUILD_TEXT' || child.type === 'GUILD_NEWS') {
								return { name: child.name, id: child.id };
							}
						}),
					],
				});
			});
		const final = [...new Set(data)];

		await bot.updateGuild(channel.guild, { channels: final });
	},
};
