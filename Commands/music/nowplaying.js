const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'nowplaying',
	aliases: ['np'],
	description: 'View what song is currently playing',
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
		if (!message.member.voice.channel) return message.reply('Cannot retrieve this guilds queue if you are not in a voice channel.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply('You are not in the same voice channel as me.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (!queue) return message.reply('No music is currently playing.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });

		// Get Playing Song
		const track = await queue.nowPlaying();

		// Generate Embed
		const embed = new MessageEmbed()
			.setTitle(track.title)
			.setURL(track.url)
			.setColor(settings.guildcolor)
			.setDescription(`**Channel›** [${track.author}](https://www.youtube.com/user/${track.author})\n**Views›** \`${bot.toThousands(track.views)}\`\n**Duration›** \`${track.durationMS > 10 ? track.duration : 'Live Stream'}\`\n**Requested By›** \`${track.requestedBy.username}\`\n**Repeated›** \`${queue.repeatMode ? 'Yes' : 'No'}\`\n**Paused›** \`${queue.setPaused() ? 'Yes' : 'No'}\``)
			.setThumbnail(track.thumbnail);
		if(track.durationMS > 10) {
			embed.setFooter(`Progress›\n${queue.createProgressBar({ timecodes: true })}`);
		}

		message.channel.send({ embeds: [embed] }).then(s => {if(settings.audit) console.log('Fix this');});
	},
};