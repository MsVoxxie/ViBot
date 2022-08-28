const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('serverinfo').setDescription('Get information about the server'),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: ["SEND_MESSAGES"],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const guild = await intGuild;
        //Create embed
        const embed = new MessageEmbed()
            .setColor(settings.guildcolor)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
			.setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields({ name: 'Guild Owner', value: `<@${guild.ownerId}>`, inline: true },
			{ name: 'Boost Level', value: guild.premiumTier !== 'NONE' ? `${Vimotes[`${guild.premiumTier}`]} ${bot.titleCase(guild.premiumTier.replace("_", " "))}` : 'None... Yet?', inline: true },
            { name: 'Total Categories', value: guild.channels.cache.filter(ch => ch.type === 'GUILD_CATEGORY').size.toString(), inline: true },
            { name: 'Total Text Channels', value: guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size.toString(), inline: true },
            { name: 'Total Voice Channels', value: guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size.toString(), inline: true },
            { name: 'Total Members', value: guild.members.cache.size.toString(), inline: true },
            { name: 'Total Humans', value: guild.members.cache.filter(mem => !mem.user.bot).size.toString(), inline: true },
            { name: 'Total Bots', value: guild.members.cache.filter(mem => mem.user.bot).size.toString(), inline: true },
            { name: 'Total Roles', value: guild.roles.cache.size.toString(), inline: true },
			{ name: 'Total Emojis', value: guild.emojis.cache.size.toString(), inline: true },
			{ name: 'Total Stickers', value: guild.stickers.cache.size.toString(), inline: true },
			{ name: 'Created', value: bot.relativeTimestamp(guild.createdAt), inline: true })
            await interaction.reply({ embeds: [embed] });
	},
};
