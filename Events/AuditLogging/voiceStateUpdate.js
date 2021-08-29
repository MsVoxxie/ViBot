const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'voiceStateUpdate',
	disabled: false,
	once: false,
	async execute(oldState, newState, bot, Vimotes) {
		//Declarations / checks
		const settings = await bot.getGuild(oldState.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await oldState.guild.channels.cache.get(settings.auditchannel);
		const chan = oldState.channel || newState.channel;
		let State;

		if (newState.channel) {
			State = `${Vimotes['JOIN_ARROW']}Connected`;
		} else {
			State = `${Vimotes['LEAVE_ARROW']}Disconnected`;
		}

		// Setup Embed
		const embed = new MessageEmbed()
			.setTitle('Voice State Changed')
			.setDescription(
				`**Member›** <@${newState.member.user.id}> | **${newState.member.user.tag}**\n**Channel›** <#${chan.id}> | **${chan.name}**\n**Status›** **${State}**`
			)
			.setColor(settings.guildcolor)
			.setFooter(`At› ${bot.Timestamp(Date().now)}`);

		logChannel.send({ embeds: [embed] });
	},
};
