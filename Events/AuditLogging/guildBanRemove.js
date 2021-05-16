const { MessageEmbed } = require('discord.js');
const { Vimotes } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'guildBanRemove',
	disabled: false,
	once: false,
	async execute(guild, user, bot) {

		// Declarations / Checks
		const settings = await bot.getGuild(guild);
		if (settings.audit === false) return;
		const logChannel = await guild.channels.cache.get(settings.auditchannel);
		const member = await guild.members.cache.get(user.id);

		// Setup Embed
		const embed = new MessageEmbed()
			.setAuthor(`${member.nickname ? `${member.nickname} | ${user.tag}` : user.tag}`, user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${Vimotes['UP_ARROW']} <@${user.id}> was Unbanned.`)
			.setColor(settings.guildcolor)
			.setFooter(bot.Timestamp(member.joinedAt));

		logChannel.send({ embed: embed });
	},
};