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

		//Generate Colors
		const colorImage = await bot.createMultiColorCircle([role.hexColor], 1024, 45);

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Role Created')
        .setDescription(`<@&${role.id}> was Created.\n**Role ID»** \`${role.id}\`\n**Role Color»** \`${role.hexColor}\`\n**Created»** <t:${Math.round(Date.now() / 1000)}:R>\n**Created by»** ${RoleData ? `<@${RoleData.executor.id}>` : 'Unknown'}`)
        .setThumbnail('attachment://col.png')
		.setColor(settings.guildcolor);

		await logChannel.send({ files: [colorImage.attachment], embeds: [embed] });
	},
};
