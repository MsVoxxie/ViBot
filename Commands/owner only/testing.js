const { SRAClient } = require("node-some-random-api");
const api = new SRAClient("PKABo8zcJrrtkfqmolR9LFZyBC5artSgVc0BEmiAdncYeUYngs977On3mimQKN0D")

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
		const msg = args.join(' ')
		api.chatBot(msg).then(res => {
			console.log(res);
		})
	},
};
