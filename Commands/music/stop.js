const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'stop',
	aliases: ['dc'],
	description: 'Stop the music',
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
		if(!message.member.voice.channel) return message.reply('You cannot stop the music when not in a voice channel.').then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});
		if(message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply('You are not in the same voice channel as me.').then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});
		if(!bot.Music.getQueue(message)) return message.reply('No music is currently playing.').then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});

		// Get Queue
		const queue = await bot.Music.getQueue(message.guild.id);

		// Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setDescription(`${message.member} stopped the music.`);

		// Stop
		const success = await queue.destroy();
		if(success) {
			await message.channel.send({ embeds: embed }).then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});
			return queue.currentEmbed.delete();
		}
	},
};