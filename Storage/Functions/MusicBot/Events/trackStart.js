const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, track, queue) => {

	// Get Settings
	const settings = await bot.getGuild(message.guild);

	// Setup Embed
	const embed = new MessageEmbed()
		.setColor(settings.guildcolor)
		.setAuthor(`Requested By› ${track.requestedBy.tag}`, track.requestedBy.displayAvatarURL({ dynamic: true }))
		.setThumbnail(track.thumbnail)
		.setDescription(`**Now Playing›** [${track.title}](${track.url})\n**Song Duration›** \`${track.durationMS > 10 ? track.duration : 'Live Stream'}\`\n**Channel›** ${message.guild.me.voice.channel}\n`)
		.setFooter(bot.Timestamp(Date.now()));

	if(queue.currentEmbed && !queue.currentEmbed.deleted) await queue.currentEmbed.delete();// return queue.currentEmbed.edit({ embeds: [embed] });
	const playing = await message.channel.send({ embeds:embed }).then(m => queue.currentEmbed = m);
	// .then(s => {if(settings.audit) s.delete({ timeout: track.durationMS > 10 ? track.durationMS : 360 * 1000 });});

	// Reaction Controls
	try {
		await playing.react('⏹');
		await playing.react('⏯');
		await playing.react('🔁');
		await playing.react('⏭');
	}
	catch (error) {
		console.error(error);
	}

	// Setup Filter and Collector
	const filter = (reaction, user) => user.id !== message.client.user.id;
	const collector = await playing.createReactionCollector(filter, { time: track.durationMS > 0 ? track.durationMS : 60 * 60 * 1000 });

	collector.on('collect', async (reaction, user) => {
		const args = ['', ''];
		await reaction.users.remove(user.id);
		switch (reaction.emoji.name) {
		case '⏹':
			bot.commands.get('stop').execute(bot, message, args, settings);
			collector.stop();
			break;

		case '⏯':
			if(bot.Music.getQueue(reaction.message).paused) {
				bot.commands.get('resume').execute(bot, message, args, settings);
			}
			else{
				bot.commands.get('pause').execute(bot, message, args, settings);
			}
			break;

		case'🔁':
			bot.commands.get('loop').execute(bot, message, args, settings);
			break;

		case '⏭':
			bot.commands.get('skip').execute(bot, message, args, settings);
			break;
		}
	});

	collector.on('end', async () => {
		if(queue.currentEmbed && !queue.currentEmbed.deleted) return await playing.reactions.removeAll();
	});

};