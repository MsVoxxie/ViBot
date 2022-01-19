const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'roleCreate',
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
		await AuditCheck(role, 'ROLE_CREATE').then((Data) => {
			RoleData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Role Created')
        .setDescription(`<@&${role.id}> was Created.\n**Role ID›** \`${role.id}\`\n**Role Color›** \`${role.hexColor}\`\n**Created by›** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}`)
        .setColor(role.hexColor);

		logChannel.send({ embeds: [embed] });
	},
};
