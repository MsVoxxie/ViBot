const { MessageEmbed } = require('discord.js');
const { Verification } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'interactionCreate',
	disabled: false,
	once: false,
	async execute(interaction, bot, Vimotes) {
		if (!interaction.isButton()) return;

		const guild = await interaction.guild;
		const settings = await bot.getGuild(guild);
		const message = await interaction.message;

		//get verification channel
		const confirmationchannelID = await settings.confirmationchannel;
		if (interaction.channel.id !== confirmationchannelID) return;

		const choice = await interaction.customId.substring(0, 4);
		const user = await guild.members.fetch(interaction.customId.substring(4));
		const clicker = await guild.members.fetch(interaction.user);

		//Get user data from Database
		// Why is this here? It's never used? Commenting out for now...
		// const UserData = await Verification.findOne({ guildid: guild.id, userid: user.id }).lean();

		//Check if clicker is staff
		const staffRoles = await settings.staffroles;
		const clickerhasStaffRole = staffRoles.some((role) => {
			const check = clicker.roles.cache.has(role);
			if (check === true) {
				return true;
			} else {
				return false;
			}
		});

		//Check if message author is staff
		const authorhasStaffRole = staffRoles.some((role) => {
			const check = user.roles.cache.has(role);
			if (check === true) {
				return true;
			} else {
				return false;
			}
		});

		if (!clickerhasStaffRole) return;
		//Check if author has the verified role already
		const hasVerifiedRole = await user.roles.cache.has(settings.verifiedrole);

		//Embed
		const Embed = new MessageEmbed().setTitle('Verification Request').setColor(settings.guildcolor);

		switch (choice) {
			case 'app_': {
				//Update Embed
				//Why is this being updated twice?? Commenting out for now...
				// Embed.setDescription(`**User Approved›** ${user} | ${user.user.tag}\n**Approved by›** ${clicker} | ${clicker.user.tag}`);
				if (authorhasStaffRole) return message.delete();
				if (hasVerifiedRole) return message.delete();

				try {

					//Update Embed
					Embed.setDescription(`**User Approved›** ${user} | ${user.user.tag}\n**Approved by›** ${clicker} | ${clicker.user.tag}`);
					
					//Add verified role
					const verifiedRole = await guild.roles.fetch(settings.verifiedrole);
					await user.roles.add(verifiedRole);
					await user.send({
						embeds: [
							bot.replyEmbed({ color: bot.colors.success, text: `*${Vimotes['CHECK']} You have been allowed access to ${message.guild.name}*` }),
						],
					});

					//Update Message
					await message.edit({ embeds: [Embed], components: [] });

					//Update Database
					await Verification.findOneAndUpdate({ guildid: guild.id, userid: user.id }, { verified: true }, { upsert: true, new: true });
				} catch (e) {
					console.error(e);
				}
				break;
			}

			case 'den_': {
				if (authorhasStaffRole) return message.delete();
				if (hasVerifiedRole) return message.delete();

				try {

					//Update Embed
					Embed.setDescription(`**User Denied** ${user} | ${user.user.tag}\n**Denied by›** ${clicker} | ${clicker.user.tag}`);

					if (settings.kickondeny) {
						//Inform the user
						await user.send({
							embeds: [
								bot.replyEmbed({ color: bot.colors.error, text: `*${Vimotes['ERROR']} You have been Denied access to ${message.guild.name}.*` }),
							],
						});
						await user.kick(`Denied by ${clicker.displayName}`);

						await message.edit({ embeds: [Embed], components: [] });

						//Update Database
						await Verification.findOneAndDelete({ guildid: guild.id, userid: user.id });
					} else {
						await user.send({
							embeds: [
								bot.replyEmbed({ color: bot.colors.error, text: `*${Vimotes['ERROR']} You have been Denied access to ${message.guild.name}.*` }),
							],
						});
					}
				} catch (e) {
					console.error(e);
				}
				break;
			}
		}
	},
};
