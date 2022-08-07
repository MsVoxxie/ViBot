const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'emojiDelete',
    disabled: false,
    once: false,
    async execute(emoji, bot) {
		const guild = emoji.guild;

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let EmojiData;

		//Wait!
		await bot.sleep(500);

		// Emoji Create Check
		await AuditCheck(emoji, 'EMOJI_DELETE').then((Data) => {
			EmojiData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Emoji Deleted')
        .setThumbnail(emoji.url)
        .setDescription(`**${emoji.name}** was Deleted.\n**Emoji ID»** \`${emoji.id}\`\n**Deleted** <t:${Math.round(Date.now() / 1000)}:R>\n**Deleted by»** ${EmojiData ? `<@${EmojiData.executor.id}>` : 'Unknown'}`)
        .setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};