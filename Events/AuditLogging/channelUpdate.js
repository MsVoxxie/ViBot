const { permissions } = require('../../Storage/Functions/miscFunctions');
const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
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
		if (newChannel.parent !== oldChannel.parent) return;
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
		// const oldChannelPerms = oldChannel.permissionOverwrites;
		// const newChannelPerms = newChannel.permissionOverwrites;
		// const permissionsAdded = newChannelPerms.filter(x => !oldChannelPerms.includes(x));
		// const permissionsRemoved = oldChannelPerms.filter(x => !newChannelPerms.includes(x));

		//Check for changes
		const channelChanges = [
			{changed : oldChannel.name === newChannel.name ? false : true, data: `${oldChannel.name !== newChannel.name ? `\n» Channel Name\n- ${oldChannel.name}\n+ ${newChannel.name}\n` : ''}`},
			{changed : oldChannel.topic !== newChannel.topic ? true : false, data: `${oldChannel.topic !== newChannel.topic ? `\n» Channel Topic\n- ${oldChannel.topic}\n+ ${newChannel.topic}\n` : ''}`},
			{changed : oldChannel.nsfw !== newChannel.nsfw ? true : false, data: `${oldChannel.nsfw !== newChannel.nsfw ? `\n» Channel NSFW\n- ${oldChannel.nsfw}\n+ ${newChannel.nsfw}\n` : ''}`},
			{changed : oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser ? true : false, data: `${oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser ? `\n» Channel Rate Limit\n- ${oldChannel.rateLimitPerUser}s\n+ ${newChannel.rateLimitPerUser}s\n` : ''}`},
			{changed : oldChannel.userLimit !== newChannel.userLimit ? true : false, data: `${oldChannel.userLimit !== newChannel.userLimit ? `\n» Channel User Limit\n- ${oldChannel.userLimit}\n+ ${newChannel.userLimit}\n` : ''}`},
			{changed : oldChannel.parentID !== newChannel.parentID ? true : false, data: `${oldChannel.parentID !== newChannel.parentID ? `\n» Channel Parent\n- ${oldChannel.parentID}\n+ ${newChannel.parentID}\n` : ''}`},
			{changed : oldChannel.position !== newChannel.position ? true : false, data: `${oldChannel.position !== newChannel.position ? `\n» Channel Position\n- ${oldChannel.position}\n+ ${newChannel.position}\n` : ''}`},
		]

		const changedText = channelChanges.filter(x => x.changed === true).map(x => x.data).join('');
		const allFalse = channelChanges.every(x => x.changed === false)


		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Channel Updated')
			.setDescription(`**Updated»** <t:${Math.round(Date.now() / 1000)}:R>\n**Update by»** ${ChannelData ? `<@${ChannelData.executor.id}>` : 'Unknown'}${!allFalse ? `\`\`\`diff\n${changedText}\`\`\`` : ''}`)
			.setFooter({ text: `Channel ID» ${oldChannel.id}` })
			.setColor(settings.guildcolor)
			// if(permissionsAdded.length) embed.addField('Permissions Added', `\`\`\`diff\n${permissionsAdded.map(perm => `+ ${permissions[perm]}`).join('\n')}\`\`\``)
			// if(permissionsRemoved.length) embed.addField('Permissions Removed', `\`\`\`diff\n${permissionsRemoved.map(perm => `- ${permissions[perm]}`).join('\n')}\`\`\``)

		logChannel.send({ embeds: [embed] });
	},
};






