const { userData } = require('../../Storage/Database/models/index.js');
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

		// Avatar Changed
		if (oldMember.displayAvatarURL({ dynamic: true }) !== newMember.displayAvatarURL({ dynamic: true })) {
			if(oldMember.id === bot.user.id) return;
			// Setup Embed
			const avatarEmbed = new MessageEmbed()
				.setTitle('Member Changed Avatar')
				.setAuthor({ name: `${newMember.user.tag}`, iconURL: newMember.displayAvatarURL({ dynamic: true }) })
				.setDescription(`**Updated›** **<t:${Math.round(Date.now() / 1000)}:R>**`)
				.setThumbnail(oldMember.displayAvatarURL({ dynamic: true }))
				.setImage(newMember.displayAvatarURL({ dynamic: true }))
				.setColor(settings.guildcolor);
			logChannel.send({ embeds: [avatarEmbed] });
		}

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
		const roleChanged = newMemberRoles.difference(oldMemberRoles);

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
				.setColor(settings.guildcolor)
				.setDescription(`**Member›** <@${newMember.user.id}> | **${newMember.user.tag}**\n**Member ID›** \`${newMember.id}\`\n**Updated›** **<t:${Math.round(Date.now() / 1000)}:R>**`)
				.addField('**Roles›**', `${roleAdded.length ? `\`\`\`css\n#ADDED\n${roleAdded.map((r) => r.name).join('\n')}\`\`\`` : `\`\`\`css\n#REMOVED\n${roleRemoved.map((r) => r.name).join('\n')}\`\`\``}`);
			logChannel.send({ embeds: [embed] });

			// Update UserData
			const userRoles = newMember.roles.cache.map((r) => { if(r.id !== newMember.guild.id) { return r.id } }).filter(x => x !== undefined);
			await userData.findOneAndUpdate({ guildid: newMember.guild.id, userid: newMember.id }, { userroles: userRoles }, { upsert: true, new: true });

		}
	},
};
