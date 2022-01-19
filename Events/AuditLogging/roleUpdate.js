const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'roleUpdate',
	disabled: false,
	once: false,
	async execute(oldRole, newRole, bot, Vimotes) {
		if (oldRole === newRole) return;

		const guild = newRole.guild;
		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let RoleData;

		//Wait!
		await bot.sleep(500);

		// Role Create Check
		await AuditCheck(role, 'ROLE_UPDATE').then((Data) => {
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
			.setDescription(`**Old Name›** ${oldRole.name}\n**Role ID›** \`${oldRole.id}\`\n**Role Color›** ${oldRole.hexColor}\n**Update by›** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}`)
			.addField('Updated Role›', `**Role Name›** **${newRole.name}**\n**New Role Color›** \`${newRole.hexColor}\``)
            .addField('Permissions Changed›', `${permissionsAdded.length ? `\n\`\`\`css\n#ADDED\n${permissionsAdded.map(perm => permissions[perm]).join('\n')}\`\`\`` : ''}${permissionsRemoved.length ? `\n\`\`\`css\n#REMOVED\n${permissionsRemoved.map(perm => permissions[perm]).join('\n')}\`\`\`` : ''}${!permissionsAdded.length || !permissionsRemoved.length ? '' : 'No Changes'}`)
			.setColor(newRole.hexColor);

		logChannel.send({ embeds: [embed] });
	},
};






