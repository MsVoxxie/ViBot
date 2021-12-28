const fetch = require('node-fetch');

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

		const res = await fetch('https://api.voxxie.me:3001/api/discord/vibot/stats').then((r) => r.json());
		console.log(res);

	},
};
