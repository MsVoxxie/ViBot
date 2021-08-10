module.exports = {
	name: 'bulkdelete',
	aliases: ['bulk', 'purge', 'bd'],
	description: 'Bulk delete a set number of messages.',
	example: '',
	category: 'moderation',
	args: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const userTarget = await message.mentions.users.first();
		let deleteAmount = parseInt(args[0]);

		//Check if an amount was given
		if (!deleteAmount) return message.reply('Please specify an amount to delete.');
		if (deleteAmount >= 101) {
			message.reply(`${deleteAmount} is greater than the maximum of 100, Defaulting to 100.`);
			deleteAmount = 99;
		}

		//Get Messages
		await message.channel.messages.fetch({ limit: deleteAmount + 1 }).then(async (messages) => {
			if (userTarget) {
				const filterBy = userTarget ? userTarget.id : bot.user.id;
				messages = await messages
					.filter((m) => m.author.id === filterBy)
					.array()
					.slice(0, deleteAmount);
			}
			//Purge!
			await message.channel.bulkDelete(messages, true).catch((e) => {
				message.reply(e.message);
			});
		});
	},
};
