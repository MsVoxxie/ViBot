const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'userUpdate',
	disabled: true,
	once: false,
	async execute(oldUser, newUser, bot) {

		// If Partial, Fetch
		if(oldUser.partial) { await oldUser.fetch(); }

		// Search for the Member
		bot.guilds.cache.forEach(async guild => {
			await guild.members.cache.forEach(async (member, memberid) => {
				if (newUser.id === memberid) {

					// Declarations / Checks
					const settings = await bot.getGuild(member.guild);
					if(!settings) return;
					if (settings.audit === false) return;
					const logChannel = await member.guild.channels.cache.get(settings.auditchannel);

					// Username Change
					if(oldUser.username !== newUser.username) {

						// Setup Embed
						const usernameEmbed = new MessageEmbed()
							.setTitle('User Changed Username')
							.setAuthor(`${member.nickname ? `${member.nickname} | ${newUser.tag}` : newUser.tag}`, oldUser.displayAvatarURL({ dynamic: true }))
							.setDescription(`**Old Username›** ${oldUser.username}\n**New Username›** ${newUser.username}`)
							.setColor(settings.guildcolor)
							.setFooter(bot.Timestamp(new Date()));

						logChannel.send({ embed: usernameEmbed });
					}

					// Discriminator Changed
					if(oldUser.discriminator !== newUser.discriminator) {

						// Setup Embed
						const discriminatorEmbed = new MessageEmbed()
							.setTitle('User Changed Discriminator')
							.setAuthor(`${member.nickname ? `${member.nickname} | ${newUser.tag}` : newUser.tag}`, oldUser.displayAvatarURL({ dynamic: true }))
							.setDescription(`**Old Discriminator›** ${oldUser.username}#${oldUser.discriminator}\n**New Discriminator›** ${newUser.username}#${newUser.discriminator}`)
							.setColor(settings.guildcolor)
							.setFooter(bot.Timestamp(new Date()));

						logChannel.send({ embed: discriminatorEmbed });
					}

					// Avatar Changed
					if (oldUser.avatar !== newUser.avatar) {

						// Setup Embed
						const avatarEmbed = new MessageEmbed()
							.setTitle('User Changed Avatar')
							.setAuthor(`${member.nickname ? `${member.nickname} | ${newUser.tag}` : newUser.tag}`, oldUser.displayAvatarURL({ dynamic: true }))
							.setThumbnail(newUser.displayAvatarURL({ dynamic: true }))
							.setImage(oldUser.displayAvatarURL({ dynamic: true }))
							.setColor(settings.guildcolor)
							.setFooter(bot.Timestamp(new Date()));

						logChannel.send({ embed: avatarEmbed });
					}
				}
			});
		});
	},
};