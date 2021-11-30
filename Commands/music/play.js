const { Player } = require('discord-player');
const playdl = require('play-dl');

module.exports = {
	name: 'play',
	aliases: ['p'],
	description: 'Play Music',
	example: 'play [name/url]',
	category: 'music',
	args: true,
	cooldown: 0,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const Search = args.join(' ');

		//Let the user know we're searching for content.
		const loading = await message.reply(`${Vimotes['A_LOADING']}Searching for your query...`);

		// Checks
		if (!Search) return message.reply(`Please enter a search term.`);
		if (!message.member.voice.channel)
			return message.reply('Please join a voice channel to play music.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
			return message.reply(`You are not in the same voice channel as me, Please join ${message.guild.me.voice.channel} to play music!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		const queue = await bot.Music.createQueue(message.guild, {
			leaveOnEnd: true,
			leaveOnEndCooldown: 90 * 1000,
			leaveOnStopCooldown: 90 * 1000,
			leaveOnEmptyCooldown: 30 * 1000,
			autoSelfDeaf: true,
			fetchBeforeQueued: true,
			enableLive: true,
			metadata: {
				message: message,
				channel: message.channel,
				voice_channel: message.member.voice.channel,
			},
			async onBeforeCreateStream(track) {
				if (track.url.includes('youtube')) {
					return (await playdl.stream(track.url)).stream;
				} else if (track.url.includes('spotify')) {
					const songs = await Player.search(track.title, {
							requestedBy: message.member,
						})
						.catch(err => {
							return console.error(err);
						})
						.then((x) => x.tracks[0]);
					return (await playdl.stream(songs.url)).stream;
				}
			},
		});

		try {
			if (!queue.connection) await queue.connect(message.member.voice.channel);
		} catch (e) {
			await message.reply(`I am unable to connect to the voice channel.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			return await queue.destroy();
		}

		const Song = await bot.Music.search(Search, {
			requestedBy: message.author,
		}).then((queueList) => {
			return queueList.tracks[0];
		});

		if (!Song) {
			await message.reply('No results found.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			await loading.delete();
			return;
		}

		if (settings.prune) {
			await loading.delete();
			await message.delete();
		}
		await queue.play(Song);
	},
};
