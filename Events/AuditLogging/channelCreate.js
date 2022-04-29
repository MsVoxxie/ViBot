const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'channelCreate',
    disabled: false,
    once: false,
    async execute(channel, bot) {
		const guild = channel.guild;

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let ChannelData;

		//Wait!
		await bot.sleep(500);

		// Channel Create Check
		await AuditCheck(channel, 'CHANNEL_CREATE').then((Data) => {
			ChannelData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Channel Created')
        .setDescription(`<#${channel.id}> was Created.\n**Parent›** ${channel.parent.name}\n**Channel ID›** \`${channel.id}\`\n**Created›** <t:${Math.round(Date.now() / 1000)}:R>\n**Created by›** ${ChannelData ? `<@${ChannelData.executor.id}>` : 'Unknown'}`)
        .setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};