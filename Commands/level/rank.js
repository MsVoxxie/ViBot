const { MessageEmbed } = require('discord.js');
const { userData } = require('../../Storage/Database/models/');

module.exports = {
	name: 'rank',
	aliases: ['level'],
	description: 'Get rank information',
	example: 'rank <options> (global, top, @member, none)',
	category: 'level',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		//Calculate needed xp
		const getNeededXP = (level) => level * level * 50;
		const TOPCOUNT = 10;

		switch (args.join(' ')) {
			case 'global': {
				//GetMember
				let Getmember = (await message.mentions.members.first()) || (await message.member);
				const member = await message.guild.members.fetch(Getmember.id);

				//Get users of guild
				const users = await userData.find({}).sort({ level: -1, xp: -1 }).lean();
				if (!users) return;

				let i = 0;
				for await (const user of users) {
					i++;
					user.rank = i;
				}

				//Get the member who requested their rank
				const me = await users.find((u) => u.guildid === message.guild.id && u.userid === member.id);
				if (!me.level) return message.delete();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${member.displayName}'s Global Rank` })
					.setColor(settings.guildcolor)
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.setDescription(`**Global Rank»** #${me.rank}\n**Current Guild Level»** ${me.level}`)
					.setFooter({ text: `• Next Level» ${bot.toThousands(me.xp)}/${bot.toThousands(getNeededXP(me.level))} •` });
				await message.channel.send({ embeds: [embed] });
				break;
			}

			case 'top': {
				//Get users of guild
				const users = await userData.find({ guildid: message.guild.id }).sort({ level: -1, xp: -1 }).limit(TOPCOUNT).lean();
				if (!users) return;

				let i = 0;
				for await (const user of users) {
					i++;
					user.rank = i;
				}

				//Get top 5 of guild
				const guildTop = users.sort((a, b) => b.level - a.level).slice(0, TOPCOUNT);

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.guild.name}'s Top ${TOPCOUNT} Members` })
					.setColor(settings.guildcolor)
					.setThumbnail(message.guild.iconURL({ dynamic: true }))
					.addFields(
						{ name: 'Guild Member', value: guildTop.map((m) => `<@${m.userid}> | Level» ${m.level}`).join('\n'), inline: true },
						{ name: 'Guild Rank', value: guildTop.map((m) => `# ${m.rank}`).join('\n'), inline: true }
					);
				await message.channel.send({ embeds: [embed] });
				break;
			}

			case 'average': {
				//get users of guild
				const users = await userData.find({ guildid: message.guild.id }).sort({ level: -1, xp: -1 }).lean();
				if(!users) return;

				//Get average
				const levels = users.map((u) => u.level).filter((i) => i != null);
				const average = await bot.getAverage(levels);

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.guild.name}'s Average Level` })
					.setColor(settings.guildcolor)
					.setThumbnail(message.guild.iconURL({ dynamic: true }))
					.setDescription(`**Guild Average»** ${Math.floor(average)}`)
				await message.channel.send({ embeds: [embed] });
				break;
			}

			case 'global top': {
				//Get users of guild
				const users = await userData.find({}).sort({ level: -1, xp: -1 }).limit(TOPCOUNT).lean();
				if (!users) return;

				let i = 0;
				for await (const user of users) {
					i++;
					user.rank = i;
				}

				//Get top 5 of guild
				const globalTop = users.sort((a, b) => b.level - a.level).slice(0, TOPCOUNT);

				const embed = new MessageEmbed()
					.setAuthor({ name: `Top ${TOPCOUNT} Global Members` })
					.setColor(settings.guildcolor)
					.addFields(
						{ name: 'Guild Member', value: globalTop.map((m) => `${m.guildid === message.guild.id ? `<@${m.userid}>` : 'Not in Guild'} | Level» ${m.level}`).join('\n'), inline: true },
						{ name: 'Guild Rank', value: globalTop.map((m) => `# ${m.rank}`).join('\n'), inline: true }
					);
				await message.channel.send({ embeds: [embed] });
				break;
			}

			default: {
				//GetMember
				let Getmember = (await message.mentions.members.first()) || (await message.member);
				const member = await message.guild.members.fetch(Getmember.id);

				//Get users of guild
				const users = await userData.find({ guildid: message.guild.id }).sort({ level: -1, xp: -1 }).lean();
				if (!users) return;

				let i = 0;
				for await (const user of users) {
					i++;
					user.rank = i;
				}

				//Get the member who requested their rank
				const me = await users.find((user) => user.userid === member.id);
				if (!me.level) return message.delete();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${member.displayName}'s Current Rank` })
					.setColor(settings.guildcolor)
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.setDescription(`**Guild Rank»** #${me.rank}\n**Current Level»** ${me.level}`)
					.setFooter({ text: `• Next Level» ${Math.round(bot.percentage(me.xp, getNeededXP(me.level)))}% | ${bot.toThousands(me.xp)}/${bot.toThousands(getNeededXP(me.level))} •` });
				await message.channel.send({ embeds: [embed] });
			}
		}
	},
};
