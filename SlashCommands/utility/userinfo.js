const { userData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Get information about yourself or another user!')
		.addUserOption((option) =>option.setName('user').setDescription('The user to get info about.')),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const intuser = (await interaction.options.getUser('user')) || intMember;
		const member = await intGuild.members.fetch(intuser.id);
        const dbMember = await userData.findOne({ guildid: intGuild.id, userid: member.id }).lean();

        //Definitions
        const currentGames = member.presence.activities.filter(a => a.type === 'PLAYING').map(a => { return `${a.name}${a.details ? `\n${a.details}` : ''}${a.state ? `\n${a.state}` : ''}`}).join('\n\n');

        //Create embed
        const embed = new MessageEmbed()
            .setColor(settings.guildcolor)
            .setAuthor({ name: `${member.user.tag}${member.user.bot ? ' - Bot' : ''}`})
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .addField('Nickname', member.nickname ? member.nickname : 'None', true)
            .addField('Online State', bot.titleCase(member.presence.status), true)
            .addField('Birthday', dbMember.birthday ? moment(Number(dbMember.birthday)).format('MMMM Do') : 'Not Set!', true)
            .addField('Commands Used', dbMember?.commandsused ? dbMember?.commandsused.toString() : 'None, Yet!', true)
            .addField('Joined Server', bot.relativeTimestamp(member.joinedAt), true)
            .addField('Account Created', bot.relativeTimestamp(member.user.createdAt), true)
            .addField('Roles', dbMember.userroles.length ? dbMember.userroles.map((r) => { return `<@&${r.id}>`} ).filter(x => x !== undefined).join(' **|** ') : 'None', false)
            if(currentGames.length > 0) { embed.addField('Currently Playing', currentGames.length > 0 ? `\`\`\`${currentGames}\`\`\`` : '\`\`\`Not playing anything\`\`\`', false) }
            if(member.presence.activities.find(a => a.type === 'CUSTOM')) { embed.addField('Custom Status', member.presence.activities.find(a => a.type === 'CUSTOM') ? `\`\`\`${member.presence.activities.find(a => a.type === 'CUSTOM').state}\`\`\`` : '\`\`\`No custom status set\`\`\`', false) }
            embed.setFooter({ text: `User ID› ${member.id}` })
            await interaction.reply({ embeds: [embed] });
    },
};
