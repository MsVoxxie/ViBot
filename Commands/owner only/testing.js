const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		let UniqueId = () => {
			let Gen4 = () => {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			};
			return `${Gen4()}${Gen4()}-${Gen4()}-${Gen4()}-${Gen4()}-${Gen4()}${Gen4()}`;
		};
		message.reply(UniqueId());
	},
};
