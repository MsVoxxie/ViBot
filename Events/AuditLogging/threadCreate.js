const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'threadCreate',
	disabled: false,
	once: false,
	async execute(threadChannel, newlyCreated, bot, Vimotes) {
		// If Partial, Fetch
		if (threadChannel.partial) {
			await threadChannel.fetch();
		}
		// Declarations / Checks
		const settings = await bot.getGuild(threadChannel.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await threadChannel.guild.channels.cache.get(settings.auditchannel);
		const threadOwner = await threadChannel.guild.members.fetch(threadChannel.ownerId);

		//Setup Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setTitle('Thread Created')
			.setDescription(`**Author›** <@${threadOwner.id}> | ${threadOwner.user.username}\n**Author ID›** ${threadOwner.id}\n**Thread Parent›** ${threadChannel.parent.name}\n**Thread Name›** ${threadChannel.name}\n**Thread Archive Duration›** ${ms(threadChannel.autoArchiveDuration * 60 * 1000, { long: true })}`)
			.setFooter({ text: `Created› ${bot.Timestamp(threadChannel.createdAt)}` });

		logChannel.send({ embeds: [embed] });
	},
};
