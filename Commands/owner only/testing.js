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
		const test = [{ channel: '391444222668177411', messageid:'845881414376226816', roles: [{ role: '750924113387847702', reaction: '✅' }] }];

		console.log(test.find(chan => chan['channel'] === '391444222668177411').roles.find(r => r['role'] === '750924113387847702'));
	},
};