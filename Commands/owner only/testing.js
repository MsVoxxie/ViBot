const fetch = require('node-fetch')
const XIVAPI = require('@xivapi/js');
const { XIVAPIKEY, XIVCOL } = require('../../Storage/Config/Config.json');
const xiv = new XIVAPI({
	private_key: XIVAPIKEY,
	language: 'en',
	snake_case: true,
});
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
		let response = await xiv.search(args.join(' '), { string_algo: 'match', indexes: ['Action'] });
			response = response.results;
			console.log(response)
	},
};
