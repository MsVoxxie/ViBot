const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'userUpdate',
	disabled: false,
	once: false,
	async execute(oldUser, newUser, bot) {
		// If Partial, Fetch
		if (oldUser.partial) {
			await oldUser.fetch();
		}

		// Search for the Member
		bot.guilds.cache.forEach(async (guild, guildid) => {
			await guild.members.cache.forEach(async (member, memberid) => {
				if (newUser.id === memberid) {
					// Declarations / Checks
					const settings = await bot.getGuild(member.guild);
					if (!settings) return;
					if (settings.audit === false) return;
					const logChannel = await member.guild.channels.cache.get(settings.auditchannel);
					if (!logChannel) return;

					// Username Change
					if (oldUser.username !== newUser.username) {
						// Setup Embed
						const usernameEmbed = new MessageEmbed()
							.setTitle('User Changed Username')
							.setAuthor({ name: `${newUser.tag}`, iconURL: newUser.displayAvatarURL({ dynamic: true }) })
							.setDescription(`**Updated»** **<t:${Math.round(Date.now() / 1000)}:R>**`)
							.addFields({ name: '**Old Username»**', value: `${oldUser.username}#${oldUser.discriminator}`, inline: false },
							{ name: '**New Username»**', value: `${newUser.username}#${newUser.discriminator}`, inline: false })
							.setColor(settings.guildcolor);
						logChannel.send({ embeds: [usernameEmbed] });
					}

					// Discriminator Changed
					if (oldUser.discriminator !== newUser.discriminator) {
						console.log(newUser.discriminator)
						// Setup Embed
						const discriminatorEmbed = new MessageEmbed()
							.setTitle('User Changed Discriminator')
							.setAuthor({ name: `${newUser.tag}`, iconURL: newUser.displayAvatarURL({ dynamic: true }) })
							.setDescription(`**Updated»** **<t:${Math.round(Date.now() / 1000)}:R>**`)
							.addFields({ name: '**New Discriminator»**', value: `${newUser.discriminator ? newUser.discriminator : 'Unknown' }`, inline: false },
							{ name: '**Old Discriminator»**', value: `${oldUser.discriminator ? oldUser.discriminator : 'Unknown' }`, inline: false })
							.setColor(settings.guildcolor);
						logChannel.send({ embeds: [discriminatorEmbed] });
					}
				}
			});
		});
	},
};
