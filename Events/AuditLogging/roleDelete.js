const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'roleDelete',
	disabled: false,
	once: false,
	async execute(role, bot, Vimotes) {
		const guild = role.guild;

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let RoleData;

		//Wait!
		await bot.sleep(500);

		// Role Create Check
		await AuditCheck(role, 'ROLE_DELETE').then((Data) => {
			RoleData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Role Deleted')
        .setDescription(`**${role.name}** was Deleted.\n**Role ID›** \`${role.id}\`\n**Role Color›** \`${role.hexColor}\`\n**Deleted by›** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}`)
        .setColor(role.hexColor);

		logChannel.send({ embeds: [embed] });
	},
};
