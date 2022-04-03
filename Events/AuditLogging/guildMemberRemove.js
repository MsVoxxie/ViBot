const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberRemove',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {

		if(member.id === bot.user.id) return;

		// If Partial, Fetch
		if (member.partial) {
			await member.fetch();
		}

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		let LeaveData;

		//Wait!
		await bot.sleep(500);

		// Kick Check
		await AuditCheck(member, 'MEMBER_KICK').then((Data) => {
			LeaveData = Data;
		});

		const logChannel = await member.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		const embed = new MessageEmbed()
			.setAuthor({ name: `${member.nickname ? `${member.nickname} | ${member.user.tag}` : member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
			.setDescription(`${Vimotes['LEAVE_ARROW']} ${member.user.tag} Left the server **<t:${Math.round(Date.now() / 1000)}:R>**.${LeaveData ? `\n**Kicked by›** <@${LeaveData.executor.id}>` : ''}${LeaveData ? `\n**Reason›** ${LeaveData.reason}` : ''}`)
			.setColor(settings.guildcolor)
			.setFooter({ text: bot.Timestamp(new Date()) });

		logChannel.send({ embeds: [embed] });
	},
};
