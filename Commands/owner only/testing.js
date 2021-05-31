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

		const roles = await message.guild.roles.cache;
		const mems = [];

		await roles.forEach(async role => {
			const re = role.members.map(mem => mem).length;
			mems.push(`${role.name} => ${re}`);
		});

		await mems.sort();

		message.channel.send(mems.join('\n'), { split:true });

	},
};