const { Twitter } = require('../../Storage/Database/models');
const { twit_api, twit_api_secret, twit_access_token, twit_access_token_secret } = require('../../Storage/Config/Config.json');
const { TwitterApi } = require('twitter-api-v2');
const TwitterClient = new TwitterApi({
	appKey: twit_api,
	appSecret: twit_api_secret,
	accessToken: twit_access_token,
	accessSecret: twit_access_token_secret,
});

module.exports = {
	name: 'watchtwitter',
	aliases: ['tw'],
	description: 'Subscribe/Unsubscribe to a twitter page for notifications.',
	example: 'tw HourlyCats',
	category: 'config',
	args: false,
	converted: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_GUILD'],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Definitions
		const LookupName = args.join(' ');

		// Lookup the requested user
		const User = await TwitterClient.v2.userByUsername(LookupName);

		// Checks if the user was found
		if (!User) return message.channel.send(`Couldn't find a user with the name \`${LookupName}\`.`);
		// Check of they exist.
		const existCheck = await Twitter.exists({ guildid: message.guild.id, twitterid: User.data.id });

		//User Exists, Delete them
		if (existCheck) {
			await Twitter.findOneAndDelete({ guildid: message.guild.id, twitterid: User.data.id });
			await bot.twitterStream();
			return message.channel.send(`Removed \`${User.data.name}\` from the watchlist.`);
		}

		// User Doesn't Exist, Create them
		if (!existCheck) {
			await Twitter.create({ guildid: message.guild.id, twitterid: User.data.id, type: 0 });
			await bot.twitterStream();
			return message.channel.send(`Added \`${User.data.name}\` to the watchlist.`);
		}
	},
};
