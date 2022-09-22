const { SlashCommandBuilder } = require('@discordjs/builders');
const { TwitchLive } = require('../../Storage/Database/models');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('deltwitch')
        .setDescription('Remove a twitch channel from my watch list')
        .addStringOption((option) => option.setName('twitch_url').setDescription('The full channel url eg; twitch.tv/namehere.').setRequired(true)),    
    options: {
        ownerOnly: false,
        userPerms: ['MANAGE_MESSAGES'],
        botPerms: ['SEND_MESSAGES'],
    },
    async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
            // Get Options
            let twitch_url = interaction.options.getString('twitch_url');

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
            if (existCheck) {
                await TwitchLive.findOneAndDelete({
                    guildid: intGuild.id,
                    twitchid: twitch_url,
                })
                return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Removed channel from my watchlist!`, }), ], ephemeral: true, });
            }

			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} This channel does not exist in my database.`, }), ], ephemeral: true, });

    },
};