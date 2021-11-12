const { TwitchWatch } = require('../../Storage/Database/models');

module.exports = {
	name: 'delchan',
	aliases: [],
	description: 'Remove a twitch channel to my watch list.',
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
		await TwitchChannels.map(async (channel) => {
			if (channel.channelname === args[0]) {
				await bot.removeTwitchChannel(message.guild, { channelname: args[0] });
				message.reply(`Removed ${args[0]} from my watch list.`).then((m) => setTimeout(() => m.delete(), 5 * 3000));
			} else {
				return;
			}
		});
	},
};
