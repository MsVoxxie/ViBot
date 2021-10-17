const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'voiceStateUpdate',
	disabled: true,
	once: false,
	async execute(oldState, newState, bot, Vimotes) {
		//Declarations / checks
		const settings = await bot.getGuild(oldState.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await oldState.guild.channels.cache.get(settings.auditchannel);
		const chan = oldState.channel || newState.channel;


		if (oldState.channel.id != null && newState.channel.id != null && newState.channel.id != oldState.channel.id) {
			console.log('a user switched channels')
		}
		if (oldState.channel.id === null) {
			console.log('a user joined!')
		}
		if (newState.channel.id === null) {
			console.log('a user left!')
		}



		if (newState.channel.id && !oldState.channel.id) {
			const embed = new MessageEmbed()
				.setTitle('Voice State Changed')
				.setDescription(`**Member›** <@${newState.member.user.id}> | **${newState.member.user.tag}**\n**Channel›** <#${chan.id}> | **${chan.name}**\n**Status›** **${Vimotes['JOIN_ARROW']}Connected**`)
				.setColor(settings.guildcolor)
				.setFooter(`At› ${bot.Timestamp(Date().now)}`);

			logChannel.send({ embeds: [embed] });
		} else if (oldState.channel.id && !newState.channel.id) {
			const embed = new MessageEmbed()
				.setTitle('Voice State Changed')
				.setDescription(`**Member›** <@${newState.member.user.id}> | **${newState.member.user.tag}**\n**Channel›** <#${chan.id}> | **${chan.name}**\n**Status›** **${Vimotes['LEAVE_ARROW']}Disconnected**`)
				.setColor(settings.guildcolor)
				.setFooter(`At› ${bot.Timestamp(Date().now)}`);

			logChannel.send({ embeds: [embed] });
		} else {
			return;
		}
	},
};
