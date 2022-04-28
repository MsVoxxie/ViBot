const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = async (bot, queue, track) => {
	// Get Settings
	const settings = await bot.getGuild(queue.guild);
	const message = queue.metadata.message;

	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor({ name: `Requested By› ${track.requestedBy.username}`, iconURL: track.requestedBy.displayAvatarURL({ dynamic: true }) })
		.setThumbnail(track.thumbnail)
		.setDescription(
			`**Now Playing›** [${track.title}](${track.url})\n**Song Duration›** \`${
				track.durationMS > 10 ? track.duration : 'Live Stream'
			}\`\n**Channel›** ${message.guild.me.voice.channel}\n`
		)
		.setFooter({ text: bot.Timestamp(Date.now()) });

	if (queue.currentEmbed) await queue.currentEmbed.delete();
	const playing = await message.channel.send({ embeds: [embed] }).then((m) => (queue.currentEmbed = m));

	// Reaction Controls
	try {
		const Buttons = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Stop').setStyle('PRIMARY').setCustomId('STOP').setEmoji('⏹️'),
			new MessageButton().setLabel('Play / Pause').setStyle('PRIMARY').setCustomId('PAUSE').setEmoji('⏯️'),
			new MessageButton().setLabel('Toggle Loop').setStyle('PRIMARY').setCustomId('LOOP').setEmoji('🔁'),
			new MessageButton().setLabel('Skip').setStyle('PRIMARY').setCustomId('SKIP').setEmoji('⏭️')
		);
		await playing.edit({ components: [Buttons] });
	} catch (error) {
		console.error(error);
	}

	const filter = (interaction) => message.author.id === interaction.user.id;
	const collector = await playing.createMessageComponentCollector({ filter, time: track.durationMS > 0 ? track.durationMS : 60 * 60 * 1000 });

	collector.on('collect', async (interaction) => {
		await interaction.deferUpdate();
		const args = ['', ''];
		switch (interaction.customId) {
			case 'STOP':
				if (!queue) return;
				bot.commands.get('stop').execute(bot, message, args, settings);
				collector.stop();
				break;

			case 'PAUSE':
				if (queue.connection.paused) {
					bot.commands.get('resume').execute(bot, message, args, settings);
				} else {
					bot.commands.get('pause').execute(bot, message, args, settings);
				}
				break;

			case 'LOOP':
				bot.commands.get('loop').execute(bot, message, args, settings);
				break;

			case 'SKIP':
				bot.commands.get('skip').execute(bot, message, args, settings);
				break;
		}
	});

	collector.on('end', async () => {
		if (queue.currentEmbed) return await playing.edit({ components: [] });
		if(playing) return await playing.delete();
	});
};
