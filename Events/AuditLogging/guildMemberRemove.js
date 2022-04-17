const { userData } = require('../../Storage/Database/models/index.js');
const { AuditCheck } = require('../../Storage/Functions/auditFunctions');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

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

		// If User is in the database, abd they left the server before 24hrs, remove them from the database
		if(await userData.exists({ userid: member.id, guildid: member.guild.id })) {
			const user = await userData.findOne({ userid: member.id, guildid: member.guild.id });
			const days = moment().diff(moment(user.joinedat), 'months', true);
			if(days <= 6){
				await userData.findOneAndDelete({ userid: member.id, guildid: member.guild.id });
			}
		}
	},
};
