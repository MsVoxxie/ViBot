const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'roleUpdate',
	disabled: false,
	once: false,
	async execute(oldRole, newRole, bot, Vimotes) {
		if (oldRole === newRole) return;
		if(newRole.position !== oldRole.position) return;

		const guild = newRole.guild;
		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let RoleData;

		//Wait!
		await bot.sleep(500);

		// Role Create Check
		await AuditCheck(newRole, 'ROLE_UPDATE').then((Data) => {
			RoleData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		//Check Permission Changes
		const oldRolePerms = oldRole.permissions.toArray();
		const newRolePerms = newRole.permissions.toArray();
		const permissionsAdded = newRolePerms.filter(x => !oldRolePerms.includes(x));
		const permissionsRemoved = oldRolePerms.filter(x => !newRolePerms.includes(x));

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Role Updated')
			.setDescription(`**Updated›** <t:${Math.round(Date.now() / 1000)}:R>\n**Update by›** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}`)
			.addField('Old Role', `**Old Name›** ${oldRole.name}\n**Old Color›** \`${oldRole.hexColor}\``)
			.addField('Updated Role›', `**New Name›** ${newRole.name}\n**New Color›** \`${newRole.hexColor ? newRole.hexColor : oldRole.hexColor}\``)
			.setFooter({ text: `Role ID› ${oldRole.id}` })
			.setColor(settings.guildcolor)
			if(permissionsAdded.length) embed.addField('Permissions Added', `\`\`\`diff\n${permissionsAdded.map(perm => `+ ${permissions[perm]}`).join('\n')}\`\`\``)
			if(permissionsRemoved.length) embed.addField('Permissions Removed', `\`\`\`diff\n${permissionsRemoved.map(perm => `- ${permissions[perm]}`).join('\n')}\`\`\``)

		logChannel.send({ embeds: [embed] });
	},
};






