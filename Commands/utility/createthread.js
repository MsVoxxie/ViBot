const ms = require('ms');

module.exports = {
	name: 'createthread',
	aliases: ['ct', 'thread'],
	description: 'Create a thread with a one hour archive timer.',
	example: 'tbd',
	category: 'utility',
	args: false,
	cooldown: 60,
	hidden: false, //Don't forget to unset this.
	ownerOnly: false, //Don't forget to unset this.
	userPerms: ['USE_PUBLIC_THREADS'],
	botPerms: ['MANAGE_THREADS'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const ThreadType = 'GUILD_PUBLIC_THREAD';
		const ThreadMessage = `${message.member.toString()} Created A Thread.`;

		//Check duration
		const Duration = 60;

		//Create The Thread
		const Thread = await message.channel.threads.create({
			name: `${message.author.username}'s Thread`,
			autoArchiveDuration: Duration,
			type: ThreadType,
			reason: ThreadMessage,
		});
	},
};
