const { MessageEmbed } = require('discord.js');
// const InviteTracker = require('@androz2091/discord-invites-tracker');
const moment = require('moment');

module.exports = {
	name: 'guildMemberAdd',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {
		// Fetch the member, just in case.
		const getMember = await member.guild.members.fetch(member.id);

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if (!settings) return;
		const logChannel = await getMember.guild.channels.cache.get(settings.auditchannel);
		const welChannel = await getMember.guild.channels.cache.get(settings.welcomechannel);
		const ruleChannel = await getMember.guild.channels.cache.get(settings.ruleschannel);

		// const Tracker = new InviteTracker(bot, {
		// 	fetchGuilds: true,
		// 	fetchVanity: true,
		// 	fetchAuditLogs: true,
		// });

		// Tracker.on('guildMemberAdd', (member, type, invite) => {
		// 	if (type === 'invite') {
		// 		const embed = new MessageEmbed()
		// 			.setColor(settings.guildcolor)
		// 			.setTitle('Invite')
		// 			.setDescription(`${member.user.tag} (${member.user.id}) joined the server using an invite.`)
		// 			.addField('Invite', invite.code, true)
		// 			.addField('Inviter', invite.inviter.tag, true)
		// 			.addField('Inviter ID', invite.inviter.id, true)
		// 			.addField('Invitee', member.user.tag, true)
		// 			.addField('Invitee ID', member.user.id, true)
		// 			.addField('Invitee Created At', moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a'), true)
		// 			.addField('Invitee Joined At', moment(member.joinedAt).format('MMMM Do YYYY, h:mm:ss a'), true)
		// 			.setTimestamp();

		// 		logChannel.send({ embed: [embed] });
		// 	}
		// });

		// If Partial, Fetch
		if (member.partial) {
			await member.fetch();
		}

		// Send Audit Message
		if (settings.audit) {
			const embed = new MessageEmbed()
				.setAuthor(`${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, getMember.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`${Vimotes['JOIN_ARROW']} <@${getMember.user.id}> Joined the server **<t:${Math.round(Date.now()/1000)}:R>**.\n**Account Created›** <t:${Math.round(getMember.joinedTimestamp/1000)}:R>`)
				.setColor(settings.guildcolor)
				.setFooter(bot.Timestamp(getMember.joinedAt));
			logChannel.send({ embeds: [embed] });
		}

		// Send Welcome Message
		if (settings.welcome) {
			const welcome = new MessageEmbed()
				.setAuthor(`${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, getMember.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`Welcome to ${getMember.guild.name}, ${getMember}!\n${ruleChannel ? `Please head on over to ${ruleChannel} and get familiar with our rules!` : 'Please enjoy your stay!'}`)
				.setFooter(`Joined› ${bot.Timestamp(getMember.joinedAt)}`)
				.setThumbnail(getMember.user.displayAvatarURL({ dynamic: true }))
				.setColor(settings.guildcolor);
			welChannel.send({ embeds: [welcome] });
		}
	},
};
