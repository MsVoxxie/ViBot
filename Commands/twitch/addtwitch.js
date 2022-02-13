const { TwitchWatch } = require('../../Storage/Database/models');

module.exports = {
	name: 'addtwitch',
	aliases: [],
	description: 'Add a twitch channel to my watch list.',
	example: '',
	category: 'twitch',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declare variables
		const Twitch = await bot.getTwitchWatch(message.guild);
		const TwitchChannels = Twitch.twitchchannels;
		const addChan = message.content.split('twitch.tv/')[1] || args[0];
		if (!addChan)
			message.reply('Please provide a channel to add.').then((s) => {
				if (settings.prune) {
					setTimeout(() => s.delete(), 30 * 1000);
				}
			});

		//Check if channel is already in the database
		const TwitchCheck = TwitchChannels.find((TwitchUser) => TwitchUser.channelname === addChan);
		if (TwitchCheck) return message.channel.send(`This channel is already in my database.`).then((m) => setTimeout(() => m.delete(), 15 * 1000));

		//Add channel to database
		const ChannelData = {
			channelname: addChan,
			postmessage: '',
			lastpost: '',
			offline: true,
		};
		await TwitchChannels.push(ChannelData);
		await Twitch.save();
		message.reply(`Added channel ${addChan} to my watch list.`).then((s) => {
			if (settings.prune) {
				setTimeout(() => s.delete(), 30 * 1000);
				setTimeout(() => message.delete(), 30 * 1000);
			}
		});
	},
};
