const { MessageEmbed } = require('discord.js');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'guildMemberAdd',
	disabled: false,
	once: false,
	async execute(member, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if(settings.audit === false) return;
		if(member.user.bot) return;
		const logChannel = await member.guild.channels.cache.get(settings.auditchannel);

		const embed = new MessageEmbed()
			.setAuthor(`${member.nickname ? `${member.nickname} | ${member.user.tag}` : member.user.tag}`, member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${Vimotes['JOIN_ARROW']} <@${member.user.id}> Joined the server.`)
			.setColor(settings.guildColor)
			.setFooter(bot.Timestamp(member.joinedAt));

		logChannel.send({ embed: embed });
	},
};