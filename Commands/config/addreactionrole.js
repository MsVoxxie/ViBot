const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'addrr',
	aliases: ['arr'],
	description: 'Setup a Reaction Role for this Guild',
	example: '',
	category: 'config',
	args: false,
	cooldown: 2,
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

		// First Question
		const questionone = await message.lineReply('Would you like to Edit an existing embed? If yes, provide that messages `ID`, Else say `no`');
		const filter = m => m.author.id === message.author.id;
		await questionone.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				if (collected.first().cleanContent !== 'no') {
					messageid = await collected.first().cleanContent;
					createNew = false;
					MessagesToClean.push(collected.first());
				}
			});
		MessagesToClean.push(questionone);

		// Second Question
		const questiontwo = await message.lineReply('What role would you like this ReactionRole to assign? Please Provide the Role ID.');
		await questiontwo.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				roleid = await collected.first().cleanContent;
				MessagesToClean.push(collected.first());
			});
		await questiontwo.delete();

		// Third Question
		const questionthree = await message.lineReply('Which emoji would you like to use for this ReactionRole? Simply say the emoji.');
		await questionthree.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] })
			.then(async collected => {
				reaction = await collected.first().cleanContent;
				MessagesToClean.push(collected.first());
			});
		await questionthree.delete();

		// Delete questions
		await message.channel.bulkDelete(MessagesToClean);

		// Let the user know that the bot is working on their request.
		const Final = await message.lineReply('Wonderful, Setting up your ReactionRole.');

		// Get Role
		const Role = await message.guild.roles.cache.get(roleid);

		// Define Embed
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor);

		if(createNew === false) {
			Message = await message.channel.messages.fetch(messageid);
			embDesc = Message.embeds[0].description += `\n${reaction} ${Role.name}`;
			embed.setDescription(embDesc);
			await Message.edit({ embed: embed });

		}
		else{
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