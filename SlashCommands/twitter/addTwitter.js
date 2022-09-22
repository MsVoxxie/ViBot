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
		.setName('addtwitter')
		.setDescription('Add a Twitter account to the watchlist.')
		.addStringOption((option) => option.setName('twitter_handle').setDescription('The Twitter handle to add').setRequired(true))
		.addStringOption((option) => option.setName('type').setDescription('Type of tweets to watch for').addChoices({ name: 'All Tweets', value: '0' }).addChoices({ name: 'Text Only', value: '1' }).addChoices({ name: 'Media Only', value: '2' }).setRequired(true))
		.addChannelOption((option) => option.setName('redirect').setDescription('Optional channel to direct this account to. Leave blank to default to guild defined channel.').addChannelTypes(0).addChannelTypes(5).addChannelTypes(11).setRequired(false)),
	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_MESSAGES'],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Get Options
		const twitter_handle = interaction.options.getString('twitter_handle');
		const type = interaction.options.getString('type');
		const redirect = interaction.options?.getChannel('redirect');

		// Lookup the requested user
		const User = await TwitterClient.v2.userByUsername(twitter_handle);

		// Checks if the user was found
		if (!User)
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Sorry, I couldn't find the user \`${twitter_handle}\`!`, }), ], ephemeral: true, });

		// Check of they exist.
		const existCheck = await Twitter.exists({ guildid: intGuild.id, twitterid: User.data.id });

		//User Exists, Delete them
		if (existCheck) {
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} The user \`${User.data.username}\` is already on the watchlist!`, }), ], ephemeral: true, });
		}

		// User Doesn't Exist, Create them
		if (!existCheck) {
			await Twitter.create({ guildid: intGuild.id, twittername: User.data.username, twitterid: User.data.id, type: Number(type), redirect: redirect?.id });
			await bot.twitterStream();
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Added \`${User.data.username}\` to the watchlist!`, }), ], ephemeral: true, });
		}
	},
};
