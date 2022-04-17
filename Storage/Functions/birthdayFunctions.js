const mongoose = require('mongoose');
const { userData } = require('../Database/models');
const { MessageEmbed } = require('discord.js');

module.exports = (bot) => {
	bot.checkBirthdays = async () => {
		for await (const g of bot.guilds.cache) {
			const guild = g[1];
			//Definitions
			const settings = await bot.getGuild(guild);
			const birthdaychannel = await guild.channels.cache.get(settings.birthdaychannel);

			//Checks
			if (!birthdaychannel) continue;
			const allMembers = await guild.members.fetch();

			for await (const users of allMembers) {
				const u = users[1];
				const user = await userData.findOne({ guildid: guild.id, userid: u.id });
				const userBirthday = new Date(parseInt(user.birthday));
				const today = new Date();
				const userBirthdayMonth = userBirthday.getMonth();
				const userBirthdayDay = userBirthday.getDate();
				const todayMonth = today.getMonth();
				const todayDay = today.getDate();

				if (userBirthdayMonth === todayMonth && userBirthdayDay === todayDay) {
					const embed = new MessageEmbed()
						.setColor(settings.guildcolor)
						.setTitle(`🎂 Happy Birthday! 🎂`)
						.setDescription(`<@${user.userid}>'s Birthday is today!`)
						.setFooter({ text: `• ${bot.shortTimestamp(Date.now())} •` });
					let msg = await birthdaychannel.send({ embeds: [embed] });
					await msg.react('🎉');
				}
			}
		}
	};
};
