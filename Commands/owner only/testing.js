const { Vimotes } = require('../../Storage/Functions/miscFunctions');
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const axios = require('axios');

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

	},
};

