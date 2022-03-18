const { Guild } = require('../../Storage/Database/models');

module.exports = {
	name: 'roleDelete',
	disabled: false,
	once: false,
	async execute(role, bot, Vimotes) {
		const guild = role.guild;

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;

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

		//Update Guild
		await Guild.findOneAndUpdate({ guildid: guild.id }, { roles: finalRoles }, { upsert: true, new: true });
	},
};
