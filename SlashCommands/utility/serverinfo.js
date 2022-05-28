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
            .addField('Guild Owner', `<@${guild.ownerId}>`, true)
			.addField('Boost Level', guild.premiumTier !== 'NONE' ? `${Vimotes[`${guild.premiumTier}`]} ${bot.titleCase(guild.premiumTier.replace("_", " "))}` : 'None... Yet?', true)
            .addField('Total Categories', guild.channels.cache.filter(ch => ch.type === 'GUILD_CATEGORY').size.toString(), true)
            .addField('Total Text Channels', guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size.toString(), true)
            .addField('Total Voice Channels', guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size.toString(), true)
            .addField('Total Members', guild.members.cache.size.toString(), true)
            .addField('Total Humans', guild.members.cache.filter(mem => !mem.user.bot).size.toString(), true)
            .addField('Total Bots', guild.members.cache.filter(mem => mem.user.bot).size.toString(), true)
            .addField('Total Roles', guild.roles.cache.size.toString(), true)
			.addField('Total Emojis', guild.emojis.cache.size.toString(), true)
			.addField('Total Stickers', guild.stickers.cache.size.toString(), true)
			.addField('Created', bot.relativeTimestamp(guild.createdAt), true)
            await interaction.reply({ embeds: [embed] });
	},
};
