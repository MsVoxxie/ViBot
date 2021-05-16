const { MessageEmbed } = require('discord.js');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'guildMemberRemove',
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
			.setDescription(`${Vimotes['LEAVE_ARROW']} <@${member.user.id}> Left the server.`)
			.setColor(settings.guildcolor)
			.setFooter(bot.Timestamp(new Date()));

		logChannel.send({ embed: embed });
	},
};