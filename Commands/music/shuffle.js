const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'shuffle',
	aliases: [],
	description: 'Shuffle the queue',
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

		// Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setDescription(`${message.member} shuffled the queue.`);

		const success = await bot.Music.shuffle(message);
		if (success) return message.channel.send({ embed: embed }).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
	},
};