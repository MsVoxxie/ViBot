const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'emojiUpdate',
    disabled: false,
    once: false,
    async execute(oldEmoji, newEmoji, bot) {
        const guild = newEmoji.guild;
		if (oldEmoji === newEmoji) return;

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let EmojiData;

		//Wait!
		await bot.sleep(500);

		// Emoji Create Check
		await AuditCheck(newEmoji, 'EMOJI_UPDATE').then((Data) => {
			EmojiData = Data;
		});

		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// Setup Embed
		const embed = new MessageEmbed()
        .setTitle('Emoji Updated')
        .setThumbnail(newEmoji.url)
        .setDescription(`**Updated»** <t:${Math.round(Date.now() / 1000)}:R>\n**Updated by»** ${EmojiData ? `<@${EmojiData.executor.id}>` : 'Unknown'}`)
        .addField('Old Emoji', `**Old Name»** ${oldEmoji.name}`)
        .addField('Updated Emoji', `**New Name»** ${newEmoji.name}`)
        .setFooter({ text: `Emoji ID» ${oldEmoji.id}` })
        .setColor(settings.guildcolor);

		logChannel.send({ embeds: [embed] });
	},
};