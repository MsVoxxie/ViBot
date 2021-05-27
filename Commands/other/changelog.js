const fs = require('fs');
const path = require('path');

module.exports = {
	name: 'changelog',
	aliases: [],
	description: 'See whats new!',
	example: '',
	category: 'other',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		try {
			const data = fs.readFileSync(path.join(__dirname, '../../Storage/Changelogs', 'CHANGELOG.md'), 'utf8');
			console.log(data);
		}
		catch (error) {
			console.error(error);
		}
	},
};