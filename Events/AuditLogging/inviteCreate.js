const { Invite } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'inviteCreate',
	disabled: false,
	once: false,
	async execute(invite, bot) {
		const inviteData = await Invite.create({
			guildid: invite.guild.id,
			invitecode: invite.code,
			inviter: invite.inviter.id,
			uses: invite.uses,
		});
		await inviteData.save();
	},
};
