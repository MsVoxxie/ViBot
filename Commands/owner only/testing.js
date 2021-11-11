const mongoose = require('mongoose');
const { TwitchWatch } = require('../../Storage/Database/models');

module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		//Declare variables
		// const data = await TwitchWatch.findOne({ guildid: message.guild.id });
		// const Twitch = data.twitchchannels;
		// const Update = Twitch.find((ch) => ch.channelname === 'Shinra_');

		// Update.offline = true;
		// data.markModified('twitchchannels');
		// await data.save();
		await bot.twitchWatch();
	},
};
