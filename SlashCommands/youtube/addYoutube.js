const { SlashCommandBuilder } = require('@discordjs/builders');
const { Youtube } = require('../../Storage/Database/models');


module.exports = {
data: new SlashCommandBuilder()
    .setName('addyoutube')
    .setDescription('Add a youtube channel to my watch list')
    .addStringOption((option) => option.setName('channel_url').setDescription('The full channel url eg; youtube.com/c/(or /channel/).').setRequired(true))
    .addStringOption((option) => option.setName('channel_name').setDescription('What should I call this channel? (This is Vanity)').setRequired(true))
    .addChannelOption((option) => option.setName('redirect').setDescription('Optional channel to direct this account to. Leave blank to default to guild defined channel.').addChannelTypes(0).addChannelTypes(5).addChannelTypes(11).setRequired(false)),

options: {
    ownerOnly: false,
    userPerms: ['MANAGE_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
},
    async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
            // Get Options
            let channel_url = interaction.options.getString('channel_url');
            const vanity_name = interaction.options.getString('channel_name');
            const redirect = interaction.options?.getChannel('redirect');

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
            if (existCheck) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} The channel \`${vanity_name}\` is already on the watchlist!`, }), ], ephemeral: true, });
        
            await Youtube.create({
                guildid: intGuild.id,
                channelid: channel_url,
                channelname: vanity_name,
                redirect: redirect?.id,
                live: false,
            })
			return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Added \`${vanity_name}\` to the watchlist!`, }), ], ephemeral: true, });

    },
};