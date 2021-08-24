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
		//Declarations
		const Search = args.join(' ');

		// Checks
		if (!Search) return message.reply(`Please enter a search term.`);
		if (!message.member.voice.channel)
			return message.reply('Please join a voice channel to play music.').then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.reply(`You are not in the same voice channel as me, Please join ${message.guild.me.voice.channel} to play music!`).then((s) => {
				if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);
			});

		const queue = await bot.Music.createQueue(message.guild, {
			leaveOnEnd: true,
			leaveOnEndCooldown: 30 * 1000,
			leaveOnStopCooldown: 30 * 1000,
			leaveOnEmptyCooldown: 20 * 1000,
			autoSelfDeaf: true,
			fetchBeforeQueued: true,
			enableLive: true,
			metadata: {
				message: message,
				channel: message.channel,
			},
		});

		try {
			if (!queue.connection) await queue.connect(message.member.voice.channel);
		} catch (e) {
			await message.reply(`I am unable to connect to the voice channel.`);
			return await queue.destroy();
		}

		const Song = await bot.Music.search(Search, {
			requestedBy: message.author,
		}).then((queueList) => {
			return queueList.tracks[0];
		});

		if (!Song) return message.reply('No results found.');

		await queue.play(Song);
	},
};
