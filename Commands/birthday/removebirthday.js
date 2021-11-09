const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'removebirthday',
	aliases: ['rbday'],
	description: 'Remove your birthday!',
	example: '',
	category: 'birthday',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Check if birthday already exists
		const Bdays = await bot.getBirthdays(message.guild);
		const Users = Bdays.birthdays;
		await Users.map(async (ID) => {
			if (ID.userid === message.author.id) {
				await bot.removeBirthday(message.guild, { userid: message.author.id });
				await message.reply(`Your birthday has been removed!`).then((m) => setTimeout(() => m.delete(), 5 * 3000));
			} else {
				await message.reply(`You don't have a birthday set!`).then((m) => setTimeout(() => m.delete(), 5 * 3000));
			}
		});
	},
};
