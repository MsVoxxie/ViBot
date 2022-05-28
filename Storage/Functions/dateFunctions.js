const mongoose = require('mongoose');
const { userData } = require('../Database/models');
const { MessageEmbed } = require('discord.js');

module.exports = (bot) => {
	//Check for birthday
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
				const userBirthday = new Date(parseInt(user?.birthday));
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
	//Check for remindsers
	bot.checkReminders = async () => {
		for await (const g of bot.guilds.cache) {
			const guild = g[1];

			//Definitions
			const allMembers = await guild.members.fetch();

			for await (const users of allMembers) {
				const u = users[1];
				const user = await userData.findOne({ guildid: guild.id, userid: u.id, reminders: { $exists: true } });
				if (!user) continue;
				const now = Date.now();
				const reminders = user?.reminders?.filter((r) => r.time <= now);
				if (!reminders) continue;

				for (const r of reminders) {
					if (!r) continue;
					try {
						const embed = new MessageEmbed()
							.setColor(bot.colors.success)
							.setTitle(`📌 Reminder 📌`)
							.setAuthor({ name: `${u.user.tag}`, iconURL: u.user.avatarURL({ dynamic: true }) })
							.setDescription(`\`\`\`${r.message}\`\`\`\n${bot.relativeTimestamp(r.time)}`);
						await u.send({ embeds: [embed] });
						await userData.findOneAndUpdate({ guildid: guild.id, userid: u.id }, { $pull: { reminders: { id: r.id } } }, { new: true });
					} catch (e) {
						return console.log(e);
					}
				}
			}
		}
	};
};
