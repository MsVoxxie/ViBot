const { MessageEmbed } = require('discord.js');
const xpSchema = require('../../Storage/Database/models/xp');

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
		const getNeededXP = (level) => level * level * 100;

		switch (args[0]) {
			case 'global': {
				//GetMember
				let Getmember = (await message.mentions.members.first()) || (await message.member);
				const member = await message.guild.members.fetch(Getmember.id);

				//Get users of guild
				const users = await xpSchema.find({}).lean();
				if (!users) return;
				users.sort((a, b) => b.level - a.level);

				//Sort, Rank, Return
				for (let i = 0; i < users.length; i++) {
					let rank = users[i].level;
					let usersWithRank = users.filter((user) => user.level === rank);
					for (let user of usersWithRank) {
						user.rank = i + 1;
					}
					i += usersWithRank.length - 1;
				}

				//Get the member who requested their rank
				const me = await users.find((u) => u.guildid === message.guild.id && u.memberid === member.id);
				if (!me.level) return message.delete();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${member.displayName}'s Global Rank` })
					.setColor(settings.guildcolor)
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.setDescription(`**Global Rank›** #${me.rank}\n**Current Guild Level›** ${me.level}`)
					.setFooter(`• Next Level› ${me.xp}/${bot.toThousands(getNeededXP(me.level))} •`);
				await message.channel.send({ embeds: [embed] });
				break;
			}

			case 'top': {
				//Get users of guild
				const users = await xpSchema.find({ guildid: message.guild.id }).lean();
				if (!users) return;
				users.sort((a, b) => b.level - a.level);

				//Sort, Rank, Return
				for (let i = 0; i < users.length; i++) {
					let rank = users[i].level;
					let usersWithRank = users.filter((user) => user.level === rank);
					for (let user of usersWithRank) {
						user.rank = i + 1;
					}
					i += usersWithRank.length - 1;
				}

				//Get top 5 of guild
				const guildTop = users.sort((a, b) => b.level - a.level).slice(0, 5);

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.guild.name}'s Top 5 Members` })
					.setColor(settings.guildcolor)
					.setThumbnail(message.guild.iconURL({ dynamic: true }))
					.addField('Guild Member', guildTop.map((m) => m.membername).join('\n'), true)
					.addField('Guild Rank', guildTop.map((m) => m.rank).join('\n'), true);
				await message.channel.send({ embeds: [embed] });
				break;
			}

			default: {
				//GetMember
				let Getmember = (await message.mentions.members.first()) || (await message.member);
				const member = await message.guild.members.fetch(Getmember.id);

				//Get users of guild
				const users = await xpSchema.find({ guildid: message.guild.id }).lean();
				if (!users) return;
				users.sort((a, b) => b.level - a.level);

				//Sort, Rank, Return
				for (let i = 0; i < users.length; i++) {
					let rank = users[i].level;
					let usersWithRank = users.filter((user) => user.level === rank);
					for (let user of usersWithRank) {
						user.rank = i + 1;
					}
					i += usersWithRank.length - 1;
				}

				//Get the member who requested their rank
				const me = await users.find((user) => user.memberid === member.id);
				if (!me.level) return message.delete();

				const embed = new MessageEmbed()
					.setAuthor({ name: `${member.displayName}'s Current Rank` })
					.setColor(settings.guildcolor)
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.setDescription(`**Guild Rank›** #${me.rank}\n**Current Level›** ${me.level}`)
					.setFooter(`• Next Level› ${me.xp}/${bot.toThousands(getNeededXP(me.level))} •`);
				await message.channel.send({ embeds: [embed] });
			}
		}
	},
};
