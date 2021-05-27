const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	name: 'guildMemberAdd',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {

		// If Partial, Fetch
		if(member.partial) { await member.fetch(); }

		// Fetch the member, just in case.
		const getMember = await member.guild.members.fetch(member.id);

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if(!settings) return;
		if(getMember.user.bot) return;
		const logChannel = await getMember.guild.channels.cache.get(settings.auditchannel);
		const welChannel = await getMember.guild.channels.cache.get(settings.welcomechannel);
		const ruleChannel = await getMember.guild.channels.cache.get(settings.ruleschannel);

		// Send Audit Message
		if(settings.audit) {
			const embed = new MessageEmbed()
				.setAuthor(`${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, getMember.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`${Vimotes['JOIN_ARROW']} <@${getMember.user.id}> Joined the server.\n**Account Created›** ${moment(getMember.user.createdAt, 'YYYMMDD h mm ss').fromNow()}`)
				.setColor(settings.guildcolor)
				.setFooter(bot.Timestamp(getMember.joinedAt));
			logChannel.send({ embed: embed });
		}

		// Send Welcome Message
		if(settings.welcome) {
			const welcome = new MessageEmbed()
				.setAuthor(`${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, getMember.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`Welcome to ${getMember.guild.name}, ${getMember}!\n${ruleChannel ? `Please head on over to ${ruleChannel} and get familiar with our rules!` : 'Please enjoy your stay!'}`)
				.setFooter(`Joined› ${bot.Timestamp(getMember.joinedAt)}`)
				.setThumbnail(getMember.user.displayAvatarURL({ dynamic: true }))
				.setColor(settings.guildcolor);
			welChannel.send({ embed: welcome });
		}
	},
};