const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberUpdate',
	disabled: false,
	once: false,
	async execute(oldMember, newMember, bot) {
		// If Partial, Fetch
		if (oldMember.partial) {
			await oldMember.fetch();
		}

		// Declarations / Checks
		const settings = await bot.getGuild(newMember.guild);
		if (!settings) return;
		if (settings.audit === false) return;
		const logChannel = await newMember.guild.channels.cache.get(settings.auditchannel);
		if (!logChannel) return;

		// NICKNAME CHANGE
		if (oldMember.nickname !== newMember.nickname) {
			const embed = new MessageEmbed()
				.setTitle('Nickname Changed')
				.setAuthor({ name: newMember.user.tag, icon_url: newMember.displayAvatarURL({ dynamic: true }) })
				.setColor(settings.guildcolor)
				.setDescription(`**Updated›** **<t:${Math.round(Date.now() / 1000)}:R>**`)
				.addField(`**Old Nickname›**`, `${oldMember.nickname ? `${oldMember.nickname}#${oldMember.user.discriminator}` : `${oldMember.displayName}#${oldMember.user.discriminator}`}`, false)
				.addField('**New Nickname›**', `${newMember.nickname ? `${newMember.nickname}#${newMember.user.discriminator}` : `${newMember.displayName}#${newMember.user.discriminator}`}`, false);
			logChannel.send({ embeds: [embed] });
		}

		// ROLE CHANGE
		const oldMemberRoles = oldMember.roles.cache;
		const newMemberRoles = newMember.roles.cache;

		let roleChanged = newMemberRoles.difference(oldMemberRoles);

		if (roleChanged.size !== 0) {
			const roleAdded = [];
			const roleRemoved = [];

			roleChanged.forEach(function (key) {
				if (newMemberRoles.has(key.id)) {
					roleAdded.push(key);
				} else {
					roleRemoved.push(key);
				}
			});

			const embed = new MessageEmbed()
				.setTitle('Role Changed')
				.setAuthor({ name: newMember.user.tag, icon_url: newMember.displayAvatarURL({ dynamic: true }) })
				.setColor(settings.guildcolor)
				.setDescription(`**Updated›** **<t:${Math.round(Date.now() / 1000)}:R>**`)
				.addField(`**Added›**`, `${roleAdded.length ? roleAdded.map((r) => r.name).join(', ') : 'None.'}`, false)
				.addField(`**Removed›**`, `${roleRemoved.length ? roleRemoved.map((r) => r.name).join(', ') : 'None'}`, false);
			logChannel.send({ embeds: [embed] });
		}
	},
};
