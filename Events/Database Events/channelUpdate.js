const { Guild } = require('../../Storage/Database/models');

module.exports = {
	name: 'channelUpdate',
	disabled: false,
	once: false,
	async execute(oldChannel, newChannel, bot) {
		if (oldChannel === newChannel) return;

		const channeldata = [];
		await newChannel.guild.channels.cache
			.filter((ch) => ch.type === 'GUILD_CATEGORY')
			.filter((x) => x !== undefined)
			.sort((a, b) => a.position - b.position)
			.map((categories) => {
				const children = categories.children.filter((ch) => ch.type === 'GUILD_TEXT' || ch.type === 'GUILD_NEWS').filter((x) => x !== undefined);

				channeldata.push({
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
		const finalChannels = [...new Set(channeldata)];

		await Guild.findOneAndUpdate(
			{ guildid: newChannel.guild.id },
			{
				guildname: newChannel.guild.name,
				channels: finalChannels,
			},
			{
				upsert: true,
				new: true,
			}
		);
	},
};
