const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberUpdate',
	disabled: false,
	once: false,
	async execute(oldMember, newMember, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(newMember.guild);
		if(settings.audit === false) return;
		const logChannel = await newMember.guild.channels.cache.get(settings.auditchannel);

		// Role Setup
		const oldMemberRoles = await oldMember.roles.cache.keyArray();
		const newMemberRoles = await newMember.roles.cache.keyArray();
		const oldRoles = await oldMemberRoles.filter(x => !newMemberRoles.includes(x));
		const newRoles = await newMemberRoles.filter(x => !oldMemberRoles.includes(x));
		const rolesChanged = await (newRoles.length || oldRoles.length);

		// Create Changed Lists
		if(rolesChanged) {
			// Roles Added
			const rolesAdded = [];
			if(newRoles.length > 0) {
				for (let i = 0; i < newRoles.length; i++) {
					rolesAdded.push(newRoles[i]);
				}
			}
			// Roles Removed
			const rolesRemoved = [];
			if(oldRoles.length > 0) {
				for(let i = 0; i < oldRoles.length; i++) {
					rolesRemoved.push(oldRoles[i]);
				}
			}

			// Create Embed
			const embed = new MessageEmbed()
				.setTitle('Members Roles Changed')
				.setAuthor(`${newMember.nickname ? `${newMember.nickname} | ${newMember.user.tag}` : newMember.user.tag}`, newMember.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`**Member›** <@${newMember.user.id}> | **${newMember.user.tag}**\n${rolesAdded.length > 0 ? `\n**Roles Added›**\n\`\`\`${rolesAdded.map(r => r.name).join(' | ')}\`\`\`` : ''}\n${rolesRemoved.length > 0 ? `**Roles Removed›**\n${rolesRemoved.map(r => r.name).join(' | ')}` : ''}`)
				.setColor(settings.guildColor)
				.setFooter(bot.Timestamp(new Date()));

			logChannel.send({ embed: embed });
		}
	},
};