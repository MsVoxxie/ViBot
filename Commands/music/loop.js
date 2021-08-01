const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'loop',
	aliases: [],
	description: 'Set the current song to loop',
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
		if (!message.member.voice.channel) return message.reply('You cannot stop the music when not in a voice channel.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply('You are not in the same voice channel as me.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });
		if (!bot.Music.getQueue(message)) return message.reply('No music is currently playing.').then(s => { if (settings.audit) s.delete({ timeout: 30 * 1000 }); });

		// Declare args
		const cmd = args.join(' ');

		// Setup Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor);

		switch (cmd.toLowerCase()) {
		case 'queue':
			if(bot.Music.getQueue(message).loopMode) {
				bot.Music.setLoopMode(message, false);
				embed.setDescription(`${message.author} Disabled Queue Repeat Mode.`);
				await message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
			}
			else{
				bot.Music.setLoopMode(message, true);
				embed.setDescription(`${message.author} Enabled Queue Repeat Mode.`);
				await message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
			}
			break;

		default:
			if(bot.Music.getQueue(message).repeatMode) {
				bot.Music.setRepeatMode(message, false);
				embed.setDescription(`${message.author} Disabled Song Repeat Mode.`);
				await message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
			}
			else{
				bot.Music.setRepeatMode(message, true);
				embed.setDescription(`${message.author} Enabled Song Repeat Mode.`);
				await message.channel.send({ embed: embed }).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
			}
			break;
		}
	},
};