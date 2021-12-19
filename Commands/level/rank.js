const { MessageEmbed } = require('discord.js');
const { createBar } = require('../../Storage/Functions/miscFunctions');
const xpSchema = require('../../Storage/Database/models/xp');

module.exports = {
	name: 'rank',
	aliases: ['level'],
	description: 'Get your current rank placement',
	example: 'rank',
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
			.setAuthor(`${member.displayName}'s Current Rank`)
			.setColor(settings.guildcolor)
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.setDescription(`**Guild Rank›** #${me.rank}\n**Current Level›** ${me.level}`)
			.setFooter(`• Next Level› ${me.xp}/${bot.toThousands(getNeededXP(me.level))} •`);
		message.channel.send({ embeds: [embed] });
	},
};
