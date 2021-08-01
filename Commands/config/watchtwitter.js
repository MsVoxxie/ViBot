const { Guild } = require('../../Storage/Database/models');
const Twit = require('twit');

const {
	twit_consumer,
	twit_consumer_secret,
	twit_access_token,
	twit_access_token_secret,
} = require('../../Storage/Config/Config.json');

const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

module.exports = {
	name: 'watchtwitter',
	aliases: ['tw'],
	description: 'Subscribe/Unsubscribe to a twitter page for notifications.',
	example: 'tw HourlyCats',
	category: 'config',
	args: false,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_GUILD'],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Definitions
		let foundUserID;
		const LookupName = args.join(' ');

		//DisplayNameToID
		Twitter.get('users/lookup', { screen_name: LookupName }, async function (err, data, response) {
			if (err) return message.reply(`Failed to find \`${LookupName}\``);
			foundUserID = data[0].id_str;

			//Add to WatchList
			const getGuild = await settings;
			const twitterwatch = getGuild.twitterwatch;
			if (twitterwatch.includes(foundUserID)) {
				twitterwatch.pull(foundUserID);
				getGuild.save();
				message.reply(`\`${LookupName}\` is already in the watchlist, Removing.`);
			} else {
				twitterwatch.push(foundUserID);
				getGuild.save();
				message.reply(`\`${LookupName}\` added to watchlist.`);
			}
			return await bot.updateStreams();
		});
	},
};
