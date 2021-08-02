const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'addrr',
	aliases: ['arr'],
	description: 'Setup a Reaction Role for this Guild',
	example: '',
	category: 'config',
	args: false,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_ROLES'],
	botPerms: ['MANAGE_ROLES'],
	async execute(bot, message, args, settings, Vimotes) {
		// Setup Variables
		let messageid;
		let Message;
		let createNew = true;
		let createTitle = false;
		let roleid;
		let reaction;
		let embDesc;
		let embTitle;
		const MessagesToClean = [];

		MessagesToClean.push(message);

		// Setup embed template.
		const qembed = new MessageEmbed().setColor(settings.guildcolor);

		// First Question
		qembed.setDescription(
			'Send an embed message ID (That I Created), Or say continue for me to make a new one.'
		);
		const questionone = await message.reply({ embeds: qembed });
		const filter = (m) => m.author.id === message.author.id;
		await questionone.channel
			.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async (collected) => {
				if (collected.first().cleanContent !== 'continue') {
					messageid = await collected.first().cleanContent;
					createNew = false;
					await collected.first().delete();
				}
			});
		await questionone.delete();

		// Second Question
		qembed.setDescription('Please provide a Role ID for me to use.');
		const questiontwo = await message.reply({ embeds: qembed });
		await questiontwo.channel
			.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async (collected) => {
				roleid = await collected.first().cleanContent;
				await collected.first().delete();
			});
		await questiontwo.delete();

		// Third Question
		qembed.setDescription('Which Emoji would you like to use?');
		const questionthree = await message.reply({ embeds: qembed });
		await questionthree.channel
			.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async (collected) => {
				reaction = await collected.first().cleanContent;
				await collected.first().delete();
			});
		await questionthree.delete();

		// Fourth Question
		qembed.setDescription('Would you like this embed to have a title? Say No for no title.');
		const questionfour = await message.reply({ embeds: qembed });
		await questionfour.channel
			.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async (collected) => {
				if (collected.first().cleanContent !== 'no') {
					createTitle = true;
					embTitle = await collected.first().cleanContent;
					await collected.first().delete();
				}
			});
		await questionfour.delete();

		// Let the user know that the bot is working on their request.
		qembed.setDescription('Wonderful, Finishing up...');
		const Final = await message.reply({ embeds: qembed });
		await Final.delete();

		// Get Role
		const Role = await message.guild.roles.cache.get(roleid);

		// Define Embed
		const embed = new MessageEmbed().setColor(settings.guildcolor);

		if (createNew === false) {
			Message = await message.channel.messages.fetch(messageid);
			embDesc = Message.embeds[0].description += `\n${reaction} ${Role.name}`;
			embTitle = Message.embeds[0].title;
			if (embTitle) {
				embed.setTitle(embTitle);
			}
			embed.setDescription(embDesc);
			await Message.edit({ embeds: [embed] });
		} else {
			if (createTitle === true) {
				embed.setTitle(embTitle);
			}
			embed.setDescription(`${reaction} ${Role.name}`);
			Message = await message.channel.send({ embeds: [embed] });
			messageid = await Message.id;
		}

		// Delete questions
		await message.channel.bulkDelete(MessagesToClean);
		await Message.react(reaction);
		await bot.addReaction(message.guild, {
			channel: message.channel.id,
			message: messageid,
			role: Role.id,
			rolename: Role.name,
			reaction: reaction,
		});
	},
};
