const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { permissions } = require('../../Storage/Functions/miscFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'channelUpdate',
	disabled: false,
	once: false,
	async execute(oldChannel, newChannel, bot, Vimotes) {
		const guild = newChannel.guild;

        // Declarations / Checks
		if (oldChannel === newChannel) return;
		if (newChannel.position !== oldChannel.position) return;
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let ChannelData;

		//Wait!
		await bot.sleep(500);

		// Role Create Check
		await AuditCheck(newChannel, 'CHANNEL_UPDATE').then((Data) => {
			ChannelData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		//Check Permission Changes Do This Later
		// const oldChannelPerms = oldChannel.permissions.toArray();
		// const newChannelPerms = newChannel.permissions.toArray();
		// const permissionsAdded = newChannelPerms.filter(x => !oldChannelPerms.includes(x));
		// const permissionsRemoved = oldChannelPerms.filter(x => !newChannelPerms.includes(x));

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Channel Updated')
			.setDescription(`**Updated›** <t:${Math.round(Date.now() / 1000)}:R>\n**Update by›** ${ChannelData ? `<@${ChannelData.executor.id}>` : 'Unknown'}`)
			.addField('Old Channel', `**Old Name›** ${oldChannel.name}\n**Old Parent›** ${oldChannel.parent.name}`)
			.addField('Updated Channel', `**New Name›** ${newChannel.name}\n**New Parent›** ${newChannel.parent.name}`)
			.setFooter({ text: `Channel ID› ${oldChannel.id}` })
			.setColor(settings.guildcolor)
			// if(permissionsAdded.length) embed.addField('Permissions Added', `\`\`\`diff\n${permissionsAdded.map(perm => `+ ${permissions[perm]}`).join('\n')}\`\`\``)
			// if(permissionsRemoved.length) embed.addField('Permissions Removed', `\`\`\`diff\n${permissionsRemoved.map(perm => `- ${permissions[perm]}`).join('\n')}\`\`\``)

		logChannel.send({ embeds: [embed] });
	},
};






