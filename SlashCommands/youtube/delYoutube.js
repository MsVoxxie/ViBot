const { SlashCommandBuilder } = require('@discordjs/builders');
const { Youtube } = require('../../Storage/Database/models');


module.exports = {
data: new SlashCommandBuilder()
    .setName('delyoutube')
    .setDescription('Remove a youtube channel to my watch list')
    .addStringOption((option) => option.setName('channel_url').setDescription('The full channel url eg; youtube.com/c/(or /channel/).').setRequired(true)),
options: {
    ownerOnly: false,
    userPerms: ['MANAGE_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
},
    async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
            // Get Options
            let channel_url = interaction.options.getString('channel_url');

            // Constants
            const REGEX = /^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)$/;

            // Check for valid url
            const Match = channel_url.match(REGEX);
            if (!Match) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Invalid channel url.`, }), ], ephemeral: true, });

            // Channel URL Regex crap
            channel_url = Match[0].split('/');
            channel_url = channel_url[channel_url.length - 1];

            // Check of they exist
            const existCheck = await Youtube.exists({ guildid: intGuild.id, channelid: channel_url });

            // Channal exists, return
            if (existCheck) {
                await Youtube.findOneAndDelete({
                    guildid: intGuild.id,
                    channelid: channel_url,
                })
                return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Removed channel from my watchlist!`, }), ], ephemeral: true, });
            }

			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} This channel does not exist in my database.`, }), ], ephemeral: true, });

    },
};