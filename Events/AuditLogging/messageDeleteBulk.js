const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageDeleteBulk',
	disabled: false,
	once: false,
	async execute(messages, bot, Vimotes) {
		//Declarations
		const firstMessage = await messages.first();
		const settings = await bot.getGuild(firstMessage.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		if (firstMessage.channel.type !== 'GUILD_TEXT') return;
		const logChannel = await firstMessage.guild.channels.cache.get(settings.auditchannel);
		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
		let LogTarget;

		//Fetch Audit Log
		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: 'MESSAGE_DELETE',
		});

		const Log = fetchedLogs.entries.first();
		const { executor, target } = Log;

		if (target.id === message.author.id) {
			LogTarget = executor.tag;
		} else {
			LogTarget = `${message.author.tag} || A Bot`;
		}

		//Filter messages
		const filteredMessages = messages.map((m) => {
			return `${m.author.username}› ${m.emeds ? 'Embeded Message' : m.content.replace(/`/g, "'")}`;
		});

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Messages Bulk Deleted')
			.setDescription(
				`**Channel›** <#${firstMessage.channel.id}> | **${firstMessage.channel.name}**\n${
					LogTarget ? `**Deleted By›** **${LogTarget}**` : ''
				}\n**Deleted Messages›**\n\`\`\`${trim(filteredMessages.join('\n\n'), 3500)}\`\`\``
			)
			.setColor(settings.guildcolor)
			.setFooter(`Executed › ${bot.Timestamp(Date.now())}`);

		logChannel.send({ embeds: [embed] });
	},
};

//message.content.replace(/`/g, "'")
