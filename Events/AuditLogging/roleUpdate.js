const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'roleUpdate',
	disabled: false,
	once: false,
	async execute(oldRole, newRole, bot, Vimotes) {

		if (oldRole === newRole) return;
		if (oldRole.position !== newRole.position) return;

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

		//Check for changes
		const roleChanges = [
			{changed : oldRole.name === newRole.name ? false : true, data: `${oldRole.name !== newRole.name ? `\n» Role Name\n- ${oldRole.name}\n+ ${newRole.name}\n` : ''}`},
			{changed : oldRole.color !== newRole.color ? true : false, data: `${oldRole.color !== newRole.color ? `\n» Role Color\n- #${oldRole.color}\n+ #${newRole.color}\n` : ''}`},
			{changed : oldRole.hoist !== newRole.hoist ? true : false, data: `${oldRole.hoist !== newRole.hoist ? `\n» Role Hoist\n- #${oldRole.hoist}\n+ #${newRole.hoist}\n` : ''}`},
			{changed : oldRole.mentionable !== newRole.mentionable ? true : false, data: `${oldRole.mentionable !== newRole.mentionable ? `\n» Role Mentionable\n- ${oldRole.mentionable}\n+ ${newRole.mentionable}\n` : ''}`},
			{changed : oldRole.position !== newRole.position ? true : false, data: `${oldRole.position !== newRole.position ? `\n» Role Position\n- ${oldRole.position}\n+ ${newRole.position}\n` : ''}`},
		]

		const changedText = roleChanges.filter(x => x.changed === true).map(x => x.data).join('');
		const allFalse = roleChanges.every(x => x.changed === false)

		//Generate Colors
		const colorImage = await bot.createMultiColorCircle([oldRole.hexColor, newRole.hexColor], 1024, 45);

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Role Updated')
			.setColor(settings.guildcolor)
			.setThumbnail('attachment://col.png')
			.setFooter({ text: `Role ID» ${oldRole.id}` })
			.setDescription(`**Updated»** <t:${Math.round(Date.now() / 1000)}:R>\n**Update by** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}${!allFalse ? `\`\`\`diff\n${changedText}\`\`\`` : ''}`);
			if(permissionsAdded.length) embed.addField('Permissions Added', `\`\`\`diff\n${permissionsAdded.map(perm => `+ ${permissions[perm]}`).join('\n')}\`\`\``);
			if(permissionsRemoved.length) embed.addField('Permissions Removed', `\`\`\`diff\n${permissionsRemoved.map(perm => `- ${permissions[perm]}`).join('\n')}\`\`\``)

		logChannel.send({ files: [colorImage.attachment], embeds: [embed] });
	},
};






