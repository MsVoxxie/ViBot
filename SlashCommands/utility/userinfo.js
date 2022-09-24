const { userData, BotData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Get information about yourself or another user!')
		.addUserOption((option) => option.setName('user').setDescription('The user to get info about.')),
	options: {
		cooldown: 5,
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const intuser = (await interaction.options.getUser('user')) || intMember;
		const member = await intGuild.members.fetch(intuser.id);
		const dbMember = await userData.findOne({ guildid: intGuild.id, userid: member.id }).lean();

		//Set up base embed=
		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor({ name: `${member.user.tag}${member.user.bot ? ' - Bot' : ''}${member.id === bot.Owners[0] ? ' - Creator of Vi!' : ''}` })
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.addFields({ name: 'Nickname', value: member.nickname ? member.nickname : 'None', inline: true },
			{ name: 'Online State', value: bot.titleCase(member?.presence?.status ? member.presence.status : 'Offline'), inline: true })
			.setFooter({ text: `User ID» ${member.id}` });

		//Specifics
		if (member.id !== intGuild.me.id) {
			try {
				//Get the users games and badges
				const currentGames = member.presence?.activities?.filter((a) => a.type === 'PLAYING').map((a) => {return `+ ${a.name}${a.details ? `\n» ${a.details}` : ''}${a.state ? `\n» ${a.state}` : ''}${a.party?.size ? `${a.party.size[0] == 1 ? `\n» Playing Solo` : `\n» In Party (${a.party?.size[0]}/${a.party?.size[1]})`}` : ''}${a.timestamps?.start ? `\n- (${bot.getDuration(a.timestamps.start, Date.now()).join(' ')})` : ''}`;}).join('\n\n');
				const userBadges = member.user.flags.toArray().length ? member.user.flags.toArray().map((flag) => `${Vimotes[`${flag}`]}`).join(' ') : 'None!';

				//Add details to the embed
				embed
					.addFields(
					{ name: 'Birthday', value: dbMember.birthday ? moment(Number(dbMember.birthday)).format('MMMM Do') : 'Not Set!', inline: true },
					{ name: 'Commands Used', value: dbMember?.commandsused ? bot.toThousands(dbMember?.commandsused.toString()) : 'None, Yet!', inline: true },
					{ name: 'Total Messages', value: dbMember?.totalmessages ? bot.toThousands(dbMember?.totalmessages.toString()) : 'None, Yet!', inline: true },
					{ name: 'Current Level', value: `${dbMember?.level ? `Level ${dbMember?.level.toString()}` : 'Leveling Disabled'}`, inline: true },
					{ name: 'Joined Server', value: bot.relativeTimestamp(member.joinedAt), inline: true },
					{ name: 'Account Created', value: bot.relativeTimestamp(member.user.createdAt), inline: true },
					{ name: 'Account Badges', value: userBadges, inline: false },
					{ name: 'Roles', value: dbMember.userroles.length? dbMember.userroles.map((r) => { return `<@&${r.id}>`; }).filter((x) => x !== undefined).join(' **|** ') : 'None',  inline: false })
				if (currentGames?.length > 0) {
					embed.addFields({ name: 'Currently Playing - ', value: currentGames.length > 0 ? `\`\`\`diff\n${currentGames}\`\`\`` : '```Not playing anything```', inline: false })
				}
				if (member.presence?.activities.find((a) => a.type === 'CUSTOM')) {
					embed.addFields({ name: 'Custom Status', value: member.presence.activities.find((a) => a.type === 'CUSTOM') ? `\`\`\`fix\n${member.presence.activities.find((a) => a.type === 'CUSTOM').state}\`\`\`` : '```No custom status set```',  inline: false })
				}
			} catch (error) {
				console.log(error);
			}
		} else if (member.id === intGuild.me.id) {
			try {
				//Get Vi's data
				const viData = await BotData.findOne({}).lean();

				//Add details to the embed
				embed
					.addFields(
					{ name: 'Commands Executed', value: dbMember?.totalmessages ? bot.toThousands(dbMember?.totalmessages.toString()) : 'None, Yet!', inline: true },
					{ name: 'I was Created', value: bot.relativeTimestamp(member.user.createdAt), inline: true },
					{ name: 'Joined Server', value: bot.relativeTimestamp(member.joinedAt), inline: true },
					{ name: 'Thanks, Vi!', value: `💕 ${viData.totalthanks}`, inline: true },
					{ name: 'Roles', value: dbMember?.userroles?.length ? dbMember.userroles.map((r) => { return `<@&${r.id}>`; }).filter((x) => x !== undefined).join(' **|** ') : 'None', finline: true })
			} catch (error) {
				console.log(error);
			}
		}
		return await interaction.reply({ embeds: [embed] });
	},
};
