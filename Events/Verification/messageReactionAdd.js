const { Guild } = require('../../Storage/Database/models/');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageReactionAdd',
	disabled: false,
	once: false,
	async execute(reaction, user, bot, Vimotes) {
		//Check if message was partial, if so fetch it.
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}

		//Ignore Bots
		if (user.bot) return;
		if (reaction.message.author.bot) return;

		//Defininitions
		const message = await reaction.message;
		const reactmember = await message.guild.members.fetch(user.id);
		const settings = await bot.getGuild(message.guild);

		//get verification channel
		const verifyChannelID = await settings.verifychannel;
		if (message.channel.id !== verifyChannelID) return;

		//Check if reactor is staff
		const staffRoles = await settings.staffroles;
		const reactorhasStaffRole = staffRoles.some((role) => {
			const check = reactmember.roles.cache.has(role);
			if (check === true) {
				return true;
			} else {
				return false;
			}
		});

		//Check if message author is staff
		const authorhasStaffRole = staffRoles.some((role) => {
			const check = message.member.roles.cache.has(role);
			if (check === true) {
				return true;
			} else {
				return false;
			}
		});

		//If reactor isnt staff, deny them!
		if (!reactorhasStaffRole) return;

		console.log(authorhasStaffRole, reactorhasStaffRole);

		//Check if author has the verified role already
		const hasVerifiedRole = await message.member.roles.cache.has(settings.verifiedrole);

		//Switchcase
		switch (reaction.emoji.name) {
			case '✅': {
				//Simple checks
				if (authorhasStaffRole) return;
				if (hasVerifiedRole) return;
				try {
					//Fetch the role
					const verifiedRole = await message.guild.roles.fetch(settings.verifiedrole);
					//Add the role to the user
					await message.member.roles.add(verifiedRole);
					//Send a message to the user
					await message.author.send(`You have been Allowed access to ${message.guild.name}!`);
					//Remove Reactions
					await message.reactions.removeAll();
				} catch (e) {
					console.log(e);
				}

				break;
			}

			case '⛔': {
				//Simple checks
				if (authorhasStaffRole) return;
				if (hasVerifiedRole) return;

				try {
					//Check if kicking is enabled
					if (settings.kickondeny) {
						//Inform the user
						await message.member.send(`You have been Denied access to ${message.guild.name}.`);
						await message.member.kick(`Denied by ${reactmember.displayName}`);
					} else {
						await message.member.send(`You have been Denied access to ${message.guild.name}.`);
					}

					//Remove Reactions
					await message.reactions.removeAll();
				} catch (e) {
					console.log(e);
				}

				break;
			}
		}
	},
};
