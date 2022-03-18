module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		if (message.author.bot) return;

		//Defininitions
		const settings = await bot.getGuild(message.guild);

		//get verification channel
		const verifyChannelID = await settings.verifychannel;
		const verifyChannel = await message.guild.channels.cache.get(verifyChannelID);
		if (!verifyChannel) return;
		if (message.channel.id !== verifyChannelID) return;

		//Check if message author is staff
		const staffRoles = await settings.staffroles;
		const hasStaffRole = staffRoles.some((role) => {
			const check = message.member.roles.cache.has(role);
			if (check === true) {
				return true;
			} else {
				return false;
			}
		});

		//Check if user is verified
		const hasVerifiedRole = await message.member.roles.cache.has(settings.verifiedrole);

		if (hasStaffRole) return;
		if (hasVerifiedRole) return;

		await message.react('✅');
		await message.react('⛔');
	},
};
