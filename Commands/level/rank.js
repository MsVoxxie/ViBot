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

		switch (args[0]) {
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
					.setDescription(`**Global Rank›** #${me.rank}\n**Current Guild Level›** ${me.level}`)
					.setFooter({ text: `• Next Level› ${bot.toThousands(me.xp)}/${bot.toThousands(getNeededXP(me.level))} •` });
				await message.channel.send({ embeds: [embed] });
				break;
			}

			case 'top': {
				//Get users of guild
				const users = await userData.find({ guildid: message.guild.id }).sort({ level: -1, xp: -1 }).limit(10).lean();
				if (!users) return;

				let i = 0;
				for await (const user of users) {
					i++;
					user.rank = i;
				}

				//Get top 5 of guild
				const guildTop = users.sort((a, b) => b.level - a.level).slice(0, 10);

				const embed = new MessageEmbed()
					.setAuthor({ name: `${message.guild.name}'s Top 10 Members` })
					.setColor(settings.guildcolor)
					.setThumbnail(message.guild.iconURL({ dynamic: true }))
					.addField('Guild Member', guildTop.map((m) => `<@${m.userid}> | Level› ${m.level}`).join('\n'), true)
					.addField('Guild Rank', guildTop.map((m) => `# ${m.rank}`).join('\n'), true);
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
					.setDescription(`**Guild Rank›** #${me.rank}\n**Current Level›** ${me.level}`)
					.setFooter({ text: `• Next Level› ${bot.toThousands(me.xp)}/${bot.toThousands(getNeededXP(me.level))} •` });
				await message.channel.send({ embeds: [embed] });
			}
		}
	},
};
