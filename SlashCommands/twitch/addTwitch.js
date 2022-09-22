const { SlashCommandBuilder } = require('@discordjs/builders');
const { TwitchLive } = require('../../Storage/Database/models');


module.exports = {
data: new SlashCommandBuilder()
    .setName('addtwitch')
    .setDescription('Add a twitch channel to my watch list')
    .addStringOption((option) => option.setName('twitch_url').setDescription('The full channel url eg; twitch.tv/namehere.').setRequired(true))
    .addChannelOption((option) => option.setName('redirect').setDescription('Optional channel to direct this channel to. Leave blank to default to guild defined channel.').addChannelTypes(0).addChannelTypes(5).addChannelTypes(11).setRequired(false)),

options: {
    ownerOnly: false,
    userPerms: ['MANAGE_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
},
    async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
            // Get Options
            let twitch_url = interaction.options.getString('twitch_url');
            const redirect = interaction.options?.getChannel('redirect');

            // Constants
            const REGEX = /^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/i;

            // Check for valid url
            const Match = twitch_url.match(REGEX);
            if (!Match) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Invalid channel url.`, }), ], ephemeral: true, });

            // Channel URL Regex crap
            twitch_url = Match[0].split('/');
            twitch_url = twitch_url[twitch_url.length - 1];

            // Check of they exist
            const existCheck = await TwitchLive.exists({ guildid: intGuild.id, twitchid: twitch_url });

            // Channal exists, return
            if (existCheck) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} The channel \`${twitch_url}\` is already on the watchlist!`, }), ], ephemeral: true, });
        
            await TwitchLive.create({
                guildid: intGuild.id,
                twitchid: twitch_url,
                redirect: redirect?.id,
                live: false,
            })
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Added \`${twitch_url}\` to the watchlist!`, }), ], ephemeral: true, });

    },
};