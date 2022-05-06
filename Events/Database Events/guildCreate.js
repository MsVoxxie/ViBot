const { Guild, Reaction, Birthdays, TwitchWatch } = require('../../Storage/Database/models');
const { getColorFromURL } = require('color-thief-node');

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
			const guildRoles = guild.roles.cache
				.sort((a, b) => b.position - a.position)
				.map((r) => {
					if (!r.managed && r.id !== guild.id) {
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

			//Generate a dominant colour of the guilds icon.
			const dominant = await getColorFromURL(guild.iconURL({ format: 'png' }));
			const domHex = bot.ConvertRGBtoHex(dominant[0], dominant[1], dominant[2]);

			//Create Guild
			await Guild.findOneAndUpdate(
				{ guildid: guild.id },
				{
					guildcolor: domHex,
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

			//Create TwitchWatch
			await bot.createTwitchWatch({ guildid: guild.id, guildname: guild.name });
		} catch (error) {
			console.error(error);
		}
	},
};
