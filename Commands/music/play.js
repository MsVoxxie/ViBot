module.exports = {
	name: 'play',
	aliases: ['p'],
	description: 'Play Music',
	example: 'play [name/url]',
	category: 'music',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		// Checks
		if(!message.member.voice.channel) return message.reply('Please join a voice channel to play music.').then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		if(message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.reply(`You are not in the same voice channel as me, Please join ${message.guild.me.voice.channel} to play music!`).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});

		// Play
		bot.Music.play(message, args.join(' '), { firstResult: true });
		message.delete({ timeout: 30 * 1000 });
	},
};