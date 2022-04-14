const { Invite } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'inviteDelete',
	disabled: false,
	once: false,
	async execute(invite, bot) {
		await Invite.findOneAndDelete({
			guildid: invite.guild.id,
			invitecode: invite.code,
		});
	},
};
