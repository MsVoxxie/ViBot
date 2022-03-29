const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Verification } = require('../../Storage/Database/models/index.js');

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
		const confirmChannel = await message.guild.channels.cache.get(settings.confirmationchannel);
		if (!confirmChannel) return;

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

		//Setup Dashboard Roles
		const Buttons = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Approve').setStyle('SUCCESS').setCustomId(`app_${message.author.id}`).setEmoji('✅'),
			new MessageButton().setLabel('Deny').setStyle('DANGER').setCustomId(`den_${message.author.id}`).setEmoji('⛔')
		);

		const Embed = new MessageEmbed()
			.setTitle('Verification Request')
			.setColor(settings.guildcolor)
			.setDescription(`${message.author} has requested to be verified in [${message.channel.name}](${message.url}).\nTheir post was created ${bot.relativeTimestamp(message.createdAt)}.\n\nPlease click ✅ to approve or ⛔ to deny.`);

			const Exists = await Verification.findOne({ guildid: message.guild.id, userid: message.author.id }).lean();
			if(Exists) return message.delete();


			const Check = await Verification.findOneAndUpdate({ guildid: message.guild.id, userid: message.author.id, messageid: message.id, verified: `${hasVerifiedRole ? true : false}` }, { }, { upsert: true, new: true })
			if(Check.verified === true) return;

			if (hasStaffRole) return;
			if (hasVerifiedRole) return;

			await confirmChannel.send({ embeds: [Embed], components: [Buttons] });
	},
};
