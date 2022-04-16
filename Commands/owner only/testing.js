const { Invite } = require('../../Storage/Database/models/');

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
		//Get current invites
		for await (const g of bot.guilds.cache) {
			const curGuild = g[1];
			try {
				const newInvites = await curGuild.invites.fetch();
				for await (const i of newInvites) {
					const invite = i[1];
					await Invite.create({
						guildid: invite.guild.id,
						invitecode: invite.code,
						inviter: invite.inviter.id,
						uses: invite.uses,
					}).then(() => {
						console.log(`Saved invite ${invite.code} for guild ${invite.guild.name}`);
					});
				}
			} catch (err) {
				continue;
			}
		}
	},
};
