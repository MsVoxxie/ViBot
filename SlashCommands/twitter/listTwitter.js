const { SlashCommandBuilder } = require('@discordjs/builders');
const { Twitter } = require('../../Storage/Database/models');
const { twit_api, twit_api_secret, twit_access_token, twit_access_token_secret } = require('../../Storage/Config/Config.json');
const { TwitterApi } = require('twitter-api-v2');
const { MessageEmbed } = require('discord.js');
const TwitterClient = new TwitterApi({
	appKey: twit_api,
	appSecret: twit_api_secret,
	accessToken: twit_access_token,
	accessSecret: twit_access_token_secret,
});

module.exports = {
	data: new SlashCommandBuilder().setName('listtwitter').setDescription('List all currently watched twitter accounts.'),
	options: {
		ownerOnly: true,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Definitions
		const Users = [];

		//  Get twitter list
		const twitterList = await Twitter.find({ guildid: intGuild.id }).sort({ type: 1 });
		const twitterTypes = { 0: 'All Tweets', 1: 'Text Only', 2: 'Media Only' };

		// Loop over each account
		for await (const User of twitterList) {
			const twitterchannel = await intGuild.channels.cache.get(settings.twitterchannel);
			const redirectchannel = await intGuild.channels.cache.get(User.redirect);
			if (!twitterchannel && !redirectchannel) continue;

			let userName = User.twittername ? `[${User.twittername}](https://twitter.com/${User.twittername})` : 'Unknown';
			const Type = twitterTypes[User.type];
			const Channel = redirectchannel ? redirectchannel : twitterchannel;

			Users.push({ userName, Type, Channel });
		}

        // Generate Embed
		const embed = new MessageEmbed()
			.setAuthor({ name: `${intGuild.name}'s Watched Twitter Accounts` })
			.setColor(settings.guildcolor)
			.setThumbnail(intGuild.iconURL({ dynamic: true }))
			.addFields(
				{ name: 'Account', value: Users.map((u) => u.userName).join('\n'), inline: true },
				{ name: 'Type', value: Users.map((u) => u.Type).join('\n'), inline: true },
				{ name: 'Channel', value: Users.map((u) => `<#${u.Channel.id}>`).join('\n'), inline: true }
			);
		await interaction.reply({ embeds: [embed] });
	},
};
