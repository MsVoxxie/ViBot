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
		let roleid;
		let reaction;
		let embDesc;
		const MessagesToClean = [];

		// Setup embed template.
		const qembed = new MessageEmbed()
			.setColor(settings.guildcolor);

		// First Question
		qembed.setDescription('Send an embed message ID (That I Created), Or say continue for me to make a new one.');
		const questionone = await message.lineReply({ embed: qembed });
		const filter = m => m.author.id === message.author.id;
		await questionone.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				if (collected.first().cleanContent !== 'continue') {
					messageid = await collected.first().cleanContent;
					createNew = false;
					MessagesToClean.push(collected.first());
				}
			});

		// Second Question
		qembed.setDescription('Please provide a Role ID for me to use.');
		const questiontwo = await message.lineReply({ embed: qembed });
		await questiontwo.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				roleid = await collected.first().cleanContent;
				MessagesToClean.push(collected.first());
			});

		// Third Question
		qembed.setDescription('Which Emoji would you like to use?');
		const questionthree = await message.lineReply({ embed: qembed });
		await questionthree.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				reaction = await collected.first().cleanContent;
				MessagesToClean.push(collected.first());
			});


		// Delete questions
		await message.channel.bulkDelete(MessagesToClean);

		// Let the user know that the bot is working on their request.
		qembed.setDescription('Wonderful, Finishing up...');
		const Final = await message.lineReply({ embed: qembed });

		// Get Role
		const Role = await message.guild.roles.cache.get(roleid);

		// Define Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor);

		if (createNew === false) {
			Message = await message.channel.messages.fetch(messageid);
			embDesc = Message.embeds[0].description += `\n${reaction} ${Role.name}`;
			embed.setDescription(embDesc);
			await Message.edit({ embed: embed });

		}
		else {
			embed.setDescription(`${reaction} ${Role.name}`);
			Message = await message.channel.send({ embed: embed });
			messageid = await Message.id;
		}

		await Message.react(reaction);
		await bot.addReaction(message.guild, { channel: message.channel.id, message: messageid, role: Role.id, rolename: Role.name, reaction: reaction });
		await Final.delete();
		await message.delete();

	},
};