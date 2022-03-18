const { Guild, Reaction, Birthdays, TwitchWatch } = require('../../Storage/Database/models');

module.exports = {
	name: 'guildCreate',
	disabled: false,
	once: false,
	async execute(guild, bot) {
		try {
			//Setup Dashboard Channels
			const channeldata = [];
			await guild.channels.cache
				.filter((ch) => ch.type === 'category')
				.filter((x) => x !== undefined)
				.sort((a, b) => a.position - b.position)
				.map((categories) => {
					const children = categories.children.filter((ch) => ch.type === 'text').filter((x) => x !== undefined);

					channeldata.push({
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
			const finalChannels = [...new Set(channeldata)];

			//Setup Dashboard Roles
			const roledata = [];
			const guildRoles = message.guild.roles.cache
				.sort((a, b) => b.position - a.position)
				.map((r) => {
					if (!r.managed && r.id !== message.guild.id) {
						return r;
					}
				})
				.filter((x) => x !== undefined);
			for await (const role of guildRoles) {
				roledata.push({
					name: role.name,
					id: role.id,
				});
			}
			//Save Roles as a non duplicating array
			const finalRoles = [...new Set(roledata)];

			//Create Guild
			await Guild.findOneAndUpdate(
				{ guildid: guild.id },
				{
					guildcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
					guildid: guild.id,
					guildname: guild.name,
					channels: finalChannels,
					roles: finalRoles,
				},
				{
					upsert: true,
					new: true,
				}
			);

			//Create Reactions
			await await bot.createReactions({ guildid: guild.id, guildname: guild.name });

			//Create Birthdays
			await bot.createBirthdays({ guildid: guild.id, guildname: guild.name });

			//Create TwitchWatch
			await bot.createTwitchWatch({ guildid: guild.id, guildname: guild.name });
		} catch (error) {
			console.error(error);
		}
	},
};
