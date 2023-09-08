const { userData, levelTransfer } = require('../../Storage/Database/models');

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
	async execute(bot, message, args, settings, Vimotes) {
		const allUserData = await userData.find({});

		for (const user of allUserData) {
			const { guildid, userid, level } = user;
			if (!guildid || !userid || !level) continue;
			const newData = await levelTransfer.create({
				guildId: guildid,
				userId: userid,
				level: level,
				xp: 0,
			});
			console.log(newData);
		}
	},
};
