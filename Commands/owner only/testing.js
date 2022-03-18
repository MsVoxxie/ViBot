module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		//Setup Dashboard Roles
		const guildRoles = await message.guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map((r) => {
				if (!r.managed && r.id !== message.guild.id) {
					return r;
				}
			})
			.filter((x) => x !== undefined);

			for (const role of guildRoles) {
				console.log(role.id, role.name);
			}
	},
};
