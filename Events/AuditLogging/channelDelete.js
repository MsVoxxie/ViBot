const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'channelDelete',
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
		await AuditCheck(channel, 'CHANNEL_DELETE').then((Data) => {
			ChannelData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Channel Deleted')
        .setDescription(`**${channel.name}** was Deleted.\n**Parent›** ${channel.parent ? channel.parent.name : 'None'}\n**Channel ID›** \`${channel.id}\`\n**Deleted›** <t:${Math.round(Date.now() / 1000)}:R>\n**Deleted by›** ${ChannelData ? `<@${ChannelData.executor.id}>` : 'Unknown'}`)
        .setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};