const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'pause',
	aliases: [],
	description: 'Pause the currently playing song.',
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
		if (!message.member.voice.channel) return message.lineReply('You cannot stop the music when not in a voice channel.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.lineReply('You are not in the same voice channel as me.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (!bot.Music.getQueue(message)) return message.lineReply('No music is currently playing.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if(bot.Music.getQueue(message).paused) return message.lineReply('Music is already paused.').then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});

		// Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setDescription(`${message.member} paused the song.`);

		const success = await bot.Music.pause(message);
		if (success) return message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
	},
};