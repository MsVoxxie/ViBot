const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberRemove',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {

		// If Partial, Fetch
		if(member.partial) { await member.fetch(); }

		// Fetch the member, just in case.
		const getMember = await member.guild.members.fetch(member.id);

		// Declarations / Checks
		const settings = await bot.getGuild(getMember.guild);
		if(!settings) return;
		if(settings.audit === false) return;
		if(getMember.user.bot) return;
		const logChannel = await getMember.guild.channels.cache.get(settings.auditchannel);

		const embed = new MessageEmbed()
			.setAuthor(`${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, getMember.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${Vimotes['LEAVE_ARROW']} <@${getMember.user.id}> Left the server.`)
			.setColor(settings.guildcolor)
			.setFooter(bot.Timestamp(new Date()));

		logChannel.send({ embed: embed });
	},
};