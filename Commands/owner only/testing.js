const mongoose = require('mongoose');
const { TwitchWatch } = require('../../Storage/Database/models');

const randomNotif = ['Hey {everyone}! {twname} is now live!', 'Heads up {everyone}, {twname} is going live!', '{twname} is live {everyone}!', "It's that time again {everyone}, Time to watch {twname}!"];

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
		let randmsg = randomNotif[Math.floor(Math.random() * randomNotif.length)];

		let msg = await randmsg.replace('{everyone}', '@everyone').replace('{twname}', 'Voxxie');

		message.channel.send(msg);
	},
};
