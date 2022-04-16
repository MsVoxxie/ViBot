const { SRAClient } = require('node-some-random-api');
const { SRAPI_Key } = require('../../Storage/Config/Config.json');
const API = new SRAClient(SRAPI_Key);

module.exports = {
	name: 'talk',
	aliases: ['say', 'vi'],
	description: 'Talk to Vibot!',
	example: '?talk hi there!',
	category: 'fun',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const msg = args.join(' ');
		API.chatBot(msg).then((res) => {
            if(!res.response || res.response.includes('<a href=')) return message.reply('I am not sure what to say!');
            message.reply(res.response);
		});
	},
};
