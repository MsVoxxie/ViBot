const mongoose = require('mongoose');
const { Birthdays } = require('../Database/models');
const { MessageEmbed } = require('discord.js');

module.exports = (bot) => {
	bot.checkBirthdays = async () => {
		bot.guilds.cache.map(async (guild) => {
			//Definitions
			const settings = await bot.getGuild(guild);
			const GuildBdays = await bot.getBirthdays(guild);
			const Userbirthdays = GuildBdays.birthdays;
			const birthdaychannel = await guild.channels.cache.get(settings.birthdaychannel);

			//Checks
			if (!birthdaychannel) return;
			if (!Userbirthdays.length) return;

			console.log(`Checking for Birthdays in› ${guild.name}`);

			for await (const user of Userbirthdays) {
				const userBirthday = new Date(parseInt(user.birthday));
				const today = new Date();
				const userBirthdayMonth = userBirthday.getMonth();
				const userBirthdayDay = userBirthday.getDate();
				const todayMonth = today.getMonth();
				const todayDay = today.getDate();

				if (userBirthdayMonth === todayMonth && userBirthdayDay === todayDay) {
					const embed = new MessageEmbed().setColor(settings.guildcolor).setTitle(`🎂 Happy Birthday! 🎂`).setDescription(`<@${user.userid}>'s Birthday is today!`).setTimestamp();
					let msg = await birthdaychannel.send({ embeds: [embed] });
					await msg.react('🎉');
				}
			}
		});
	};
};
