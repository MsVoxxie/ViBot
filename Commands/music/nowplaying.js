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
		// Checks
		if (!message.member.voice.channel) return message.reply('Cannot retrieve this guilds queue if you are not in a voice channel.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply('You are not in the same voice channel as me.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (!bot.Music.getQueue(message)) return message.reply('No music is currently playing.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });

		// Get Playing Song
		const track = await bot.Music.nowPlaying(message);

		// Generate Embed
		const embed = new MessageEmbed()
			.setTitle(track.title)
			.setURL(track.url)
			.setColor(settings.guildcolor)
			.setDescription(`**Channel›** [${track.author}](https://www.youtube.com/user/${track.author})\n**Views›** \`${bot.toThousands(track.views)}\`\n**Duration›** \`${track.durationMS > 10 ? track.duration : 'Live Stream'}\`\n**Requested By›** \`${track.requestedBy.username}\`\n**Repeated›** \`${bot.Music.getQueue(message).repeatMode ? 'Yes' : 'No'}\`\n**Paused›** \`${bot.Music.getQueue(message).paused ? 'Yes' : 'No'}\``)
			.setThumbnail(track.thumbnail);
		if(track.durationMS > 10) {
			embed.setFooter(`Progress›\n${bot.Music.createProgressBar(message, { timecodes: true })}`);
		}

		message.channel.send({ embed: embed }).then(s => {if(settings.audit) s.delete({ timeout: track.durationMS > 10 ? track.durationMS : 360 * 1000 });});
	},
};