const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberRemove',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {

		// If Partial, Fetch
		if(member.partial) { await member.fetch(); }

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if(!settings) return;
		if(settings.audit === false) return;
		const logChannel = await member.guild.channels.cache.get(settings.auditchannel);

		const embed = new MessageEmbed()
			.setAuthor({ name: `${member.nickname ? `${member.nickname} | ${member.user.tag}` : member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true })})
			.setDescription(`${Vimotes['LEAVE_ARROW']} ${member.user.tag} Left the server **<t:${Math.round(Date.now()/1000)}:R>**.`)
			.setColor(settings.guildcolor)
			.setFooter(bot.Timestamp(new Date()));

		logChannel.send({ embeds: [embed] });
	},
};