const { SlashCommandBuilder } = require('@discordjs/builders');
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
	data: new SlashCommandBuilder()
		.setName('deltwitter')
		.setDescription('Remove a Twitter account from the watchlist.')
		.addStringOption((option) => option.setName('twitter_handle').setDescription('The Twitter handle to add').setRequired(true)),
	options: {
		ownerOnly: true,
		userPerms: ['MANAGE_MESSAGES'],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Get Options
		const twitter_handle = interaction.options.getString('twitter_handle');

		// Lookup the requested user
		const User = await TwitterClient.v2.userByUsername(twitter_handle);

		// Checks if the user was found
		if (!User)
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Sorry, I couldn't find the user \`${twitter_handle}\`!`, }), ], ephemeral: true, });

		// Check of they exist.
		const existCheck = await Twitter.exists({ guildid: intGuild.id, twitterid: User.data.id });

		//User Exists, Delete them
		if (existCheck) {
            await Twitter.findOneAndDelete({ guildid: intGuild.id, twitterid: User.data.id });
			await bot.twitterStream();
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['CHECK']} Removed \`${User.data.name}\` from the watchlist!`, }), ], ephemeral: true, });
		}

		// User Doesn't Exist, Create them
		if (!existCheck) {
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['ALERT']} \`${User.data.name}\` is not on the watchlist!`, }), ], ephemeral: true, });
		}
	},
};
