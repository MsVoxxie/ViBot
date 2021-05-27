const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'messageReactionRemove',
	disabled: false,
	once: false,
	async execute(msg, user, bot, Vimotes) {
		if(msg.message.partial) { await msg.message.fetch(); }
		if(user.bot) return;
		const data = await bot.getReactions(msg.message.guild);
		const roles = await data.reactionRoles;
		const valid = await roles.find(reaction => reaction['reaction'] === msg.emoji.name);
		const Role = await msg.message.guild.roles.cache.get(valid.role);
		const member = await msg.message.guild.members.cache.get(user.id);

		if(msg.emoji.name === valid.reaction && msg.message.id === valid.message) {
			if(!member.roles.cache.some(r => r.name === Role.name)) return;
			await member.roles.remove(Role);

			try {
				// Define Embed
				const embed = new MessageEmbed()
					.setAuthor(msg.message.guild.name, msg.message.guild.iconURL({ dynamic:true }))
					.setColor(Role.color)
					.setDescription(`${Vimotes['XMARK']}${Role.name} Removed.`);
				await member.send({ embed: embed }).then(s => s.delete({ timeout: 30 * 1000 }));
			}
			catch (error) {
				console.log('failed');
				return;
			}
		}
	},
};