const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'queue',
	aliases: [],
	description: 'Display the current music queue',
	example: '',
	category: 'music',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// Get Queue
		const queue = await bot.Music.getQueue(message.guild.id);
		// Checks
		if (!message.member.voice.channel)
			return message.reply('Please join a voice channel to play music.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.reply(`You are not in the same voice channel as me, Please join ${message.guild.me.voice.channel} to play music!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (!queue)
			return message.reply('No music is currently playing.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		// Declarations
		let currentPage = 0;
		const totalTime = ms(queue.totalTime, { long: true });
		const embeds = generateQueueEmbed(message, queue.tracks, settings, totalTime);

		// Generate Embed Message
		const queueEmbed = await message.channel.send({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });

		// Add reactions to embed message
		try {
			await queueEmbed.react('⬅️');
			await queueEmbed.react('⏹');
			await queueEmbed.react('➡️');
		} catch (error) {
			return message.reply('An error occurred!');
		}

		// Create filter and Collector
		const filter = (reaction, user) => ['⬅️', '⏹', '➡️'].includes(reaction.emoji.name) && message.author.id === user.id;
		const collector = await queueEmbed.createReactionCollector({ filter, time: 60 * 1000 });

		// Do the Things!
		collector.on('collect', async (reaction, user) => {
			switch (reaction.emoji.name) {
				case '➡️':
					await reaction.users.remove(message.author.id);
					if (currentPage < embeds.length - 1) {
						currentPage++;
						queueEmbed.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });
					}
					break;

				case '⏹':
					collector.stop();
					reaction.message.reactions.removeAll();
					if (settings.prune) {
						queueEmbed.delete();
					}
					break;

				case '⬅️':
					await reaction.users.remove(message.author.id);
					if (currentPage !== 0) {
						currentPage--;
						queueEmbed.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}›**`, embeds: [embeds[currentPage]] });
					}
					break;
			}
		});
	},
};

function generateQueueEmbed(message, queue, settings, totalTime) {
	const embeds = [];
	let k = 10;

	for (let i = 0; i < queue.length; i += 10) {
		const current = queue.slice(i, k);
		let j = i;
		k += 10;

		const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join('\n');

		const embed = new MessageEmbed()
			.setTitle('Song Queue\n')
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.setColor(settings.guildcolor)
			.setDescription(`**Current Song - [${queue[0].title}](${queue[0].url})**\n\n${info}`)
			.setFooter(`Playlist Duration› ${totalTime}`);
		embeds.push(embed);
	}

	return embeds;
}
