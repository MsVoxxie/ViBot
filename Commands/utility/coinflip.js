const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'coinflip',
	aliases: ['flip'],
	description: 'Heads or Tails!',
	example: 'flip',
	category: 'utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const Coins = [
			{ url: 'https://cdn.discordapp.com/attachments/746187996084043849/924161457690640384/1.gif', side: 'Tails' },
			{ url: 'https://cdn.discordapp.com/attachments/746187996084043849/924161457367683102/0.gif', side: 'Heads' },
		];

		const Index = Math.round(Math.random() * Coins.length);
		await message.reply(`${Coins[Index].url}`);
	},
};
