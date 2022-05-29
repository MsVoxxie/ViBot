const { Invite, userData } = require('../../Storage/Database/models/index.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	name: 'guildMemberAdd',
	disabled: false,
	once: false,
	async execute(member, bot, Vimotes) {
		if (member.id === bot.user.id) return;

		// Fetch the member, just in case.
		const getMember = await member.guild.members.fetch(member.id);

		// Declarations / Checks
		const settings = await bot.getGuild(member.guild);
		if (!settings) return;

		//Check if kick new is enabled.
		if (settings.kicknew) {
			const today = moment().startOf('day');
			const createdDate = moment(getMember.user.createdAt).startOf('day');
			const diff = today.diff(createdDate, 'days');

			if (diff <= 14) {
				try {
					return await getMember.kick('Account created less than 14 days ago.');
				} catch (e) {
					console.log(e);
				}
			}
		}

		//Get Channels
		const logChannel = await getMember.guild.channels.cache.get(settings.auditchannel);
		const welChannel = await getMember.guild.channels.cache.get(settings.welcomechannel);
		const ruleChannel = await getMember.guild.channels.cache.get(settings.ruleschannel);

		//Get current invites
		const newInvites = await member.guild.invites.fetch();
		const oldInvites = await Invite.find({ guildid: member.guild.id }).lean();
		const invite = newInvites.find((i) => i.uses > oldInvites.find((o) => o.invitecode === i.code).uses);
		const inviter = await member.guild.members.cache.get(invite?.inviter?.id);

		//Update the invite
		await Invite.findOneAndUpdate({ guildid: member.guild.id, invitecode: invite?.code }, { uses: invite?.uses });

		// console.log(invite);

		// If Partial, Fetch
		if (member.partial) {
			await member.fetch();
		}

		// Send Audit Message
		if (settings.audit) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, iconURL: getMember.user.displayAvatarURL({ dynamic: true }), })
				.setDescription( `${Vimotes['JOIN_ARROW']} **<@${getMember.id}> | ${getMember.user.tag}** Joined the server **<t:${Math.round( Date.now() / 1000 )}:R>**.\n**Account Created›** <t:${Math.round(getMember.user.createdTimestamp / 1000)}:R>\n**Invite Used›** ${ invite ? invite.code : 'Unknown!' }\n**Invite Creator›** ${inviter ? inviter : 'Unknown!'}` )
				.setColor(settings.guildcolor);
			logChannel.send({ embeds: [embed] });
		}

		// Send Welcome Message
		if (settings.welcome) {
			const welcome = new MessageEmbed()
				.setAuthor({ name: `${getMember.nickname ? `${getMember.nickname} | ${getMember.user.tag}` : getMember.user.tag}`, iconURL: getMember.user.displayAvatarURL({ dynamic: true }), })
				.setDescription(`Welcome to ${getMember.guild.name}, ${getMember}!\n${ruleChannel ? `Please head on over to ${ruleChannel} and get familiar with our rules!` : 'Please enjoy your stay!'}`)
				.setThumbnail(getMember.user.displayAvatarURL({ dynamic: true }))
				.setColor(settings.guildcolor);
			welChannel.send({ embeds: [welcome] });
		}

		// Add the member to the database
		if (!(await userData.exists({ userid: getMember.id, guildid: getMember.guild.id }))) {
			await userData.create({
				guildid: getMember.guild.id,
				userid: getMember.id,
				joinedat: getMember.joinedAt,
				receivedm: true,
				bottomcount: 0,
				userroles: [],
			});
		} else {
			const oldUser = await userData.findOneAndUpdate({ guildid: getMember.guild.id, userid: getMember.id }, { joinedat: Date.now() });
			const userRoles = oldUser.userroles;
			if(!userRoles.length) return;

			// Add old user roles back.
			let addedRoles = [];
			let failedRoles = [];
			for await (const role of userRoles) {
				console.log(role);
				try {
					const r = await getMember.guild.roles.fetch(role.id);
					await getMember.roles.add(r);
					addedRoles.push(r);
				} catch (e) {
					const r = await getMember.guild.roles.fetch(role.id);
					failedRoles.push(r);
					continue;
				}
			}
			//Create Embed
			const qembed = new MessageEmbed()
				.setThumbnail(getMember.guild.iconURL({ dynamic: true }))
				.setDescription(`Welcome back to ***${getMember.guild.name}***, ${getMember}!\nYou had some roles before, I have reassigned them for you.\n\`\`\`diff\n+ Assigned›\n${addedRoles.map((r) => `› ${r.name}`).join('\n')}\`\`\`\n\`\`\`diff\n- Unassignable›\n${failedRoles.map((r) => `› ${r.name}`).join('\n')}\`\`\``)
				.setColor(settings.guildcolor);

			//Send Message
			await getMember.send({ embeds: [qembed] });
		}
	},
};
