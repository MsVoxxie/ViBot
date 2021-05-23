module.exports = {
	name: 'messageReactionRemove',
	disabled: false,
	once: false,
	async execute(msg, user, bot) {
		if(user.bot) return;
		const data = await bot.getReactions(msg.message.guild);
		const roles = await data.reactionRoles;
		const valid = await roles.find(reaction => reaction['reaction'] === msg.emoji.name);
		const Role = await msg.message.guild.roles.cache.get(valid.role);
		const member = await msg.message.guild.members.cache.get(user.id);

		if(msg.emoji.name === valid.reaction && msg.message.id === valid.message) {
			if(!member.roles.cache.some(r => r.name === Role.name)) return;
			await member.roles.remove(Role);
			await member.send(`**Removed Role›** ${Role.name}`);
		}
	},
};