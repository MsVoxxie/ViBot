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
		// Assume staff roles are not assignable.
		const ignoredRoles = [
			'ADMINISTRATOR',
			'KICK_MEMBERS',
			'BAN_MEMBERS',
			'MANAGE_CHANNELS',
			'VIEW_AUDIT_LOG',
			'MANAGE_GUILD',
		];
		const Roles = message.guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(r => {
				if (
					!r.permissions.any(ignoredRoles) &&
				!r.managed &&
				r.id !== message.guild.id &&
				!r.name.includes('Muted') &&
				!r.name.includes('Trusted') &&
				!r.name.includes('Nitro')
				) {return `${r.name} -> ${r.id}`;}
			})
			.filter(x => x !== undefined).join('\n');
		message.channel.send(Roles, { split: true });
	},
};