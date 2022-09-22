const { TwitchWatch } = require('../../Storage/Database/models');

module.exports = {
	name: 'deltwitch',
	aliases: [],
	description: 'Remove a twitch channel to my watch list.',
	example: '',
	category: 'twitch',
	args: true,
	cooldown: 2,
	converted: true,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declare variables
		const Twitch = await bot.getTwitchWatch(message.guild);
		const TwitchChannels = Twitch.twitchchannels;
		const delChan = message.content.split('twitch.tv/')[1] || args[0];
		await TwitchChannels.map(async (channel) => {
			if (delChan) {
				await bot.removeTwitchChannel(message.guild, { channelname: args[0] });
				message.reply(`Removed ${delChan} from my watch list.`).then((s) => {
					if (settings.prune) {
						setTimeout(() => s.delete(), 30 * 1000);
						setTimeout(() => message.delete(), 30 * 1000);
					}
				});
			} else {
				return;
			}
		});
	},
};
