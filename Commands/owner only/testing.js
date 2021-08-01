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

		const data = [];
		await message.guild.channels.cache.filter(ch => ch.type === 'category').filter(x => x !== undefined).sort((a, b)=> a.position - b.position).map(categories => {
			const children = categories.children.filter(ch => ch.type === 'text').filter(x => x !== undefined);

			data.push(
				{ category: categories.name, channels: [children.map(child => {
					if(child.type === 'text') {
						return { name: child.name, id: child.id } ;
					}
				})] },
			);

		});
		const final = [...new Set(data)];
		console.log(final.map(m => m.category));
	},
};