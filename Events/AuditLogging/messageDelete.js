const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	disabled: false,
	once: false,
	async execute(message, bot, Vimotes) {
		// check if partial
		if (message.partial) return;
		if (!message.guild) return;
		if (message.denyDeleteEvent) return;

		// Declarations / Checks
		const settings = await bot.getGuild(message.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		if (message.author.bot) return;
		if (message.channel.type === 'DM') return;
		let MessageData;

		//Wait!
		await bot.sleep(500);

		//Fetch Audit Log
		await AuditCheck(message, 'MESSAGE_DELETE').then((Data) => {
			MessageData = Data;
		});

		const logChannel = await message.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.setDescription(
				`**Author»** **<@${message.author.id}> | ${message.author.tag}**\n**Deleted By»** **${
					MessageData ? `<@${MessageData.executor.id}> | ${MessageData.executor.tag}` : `<@${message.author.id}> | ${message.author.tag}`
				}**\n**Channel»** <#${message.channel.id}> | **${message.channel.name}**\n**Deleted»** **<t:${Math.round(Date.now() / 1000)}:R>**\n${
					message.content.length > 0 ? `\n**Deleted Message»**\n${message.content}` : ''
				}\n${
					message.attachments.size > 0
						? `**Attachment URL» ${message.channel.nsfw ? '🔞' : ''} **[Image Link](${message.attachments.map((a) => a.proxyURL)})`
						: ''
				}`
			)
			.setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};
