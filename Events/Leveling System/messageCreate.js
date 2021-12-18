const xpSchema = require('../../Storage/Database/models/xp');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {

		// If Partial, Fetch
		if(message.partial) { await message.fetch(); }

		//Declarations
		if(message.author.bot) return;
		const { guild, member } = message;
		const settings = await bot.getGuild(guild);
		const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
		const xpadd = clamp(Math.round(Math.random() * message.content.length), 1, 100);

		//Check
		const levelChannel = await guild.channels.cache.get(settings.levelchannel);
		if (!levelChannel) return;

		//Add XP
		await addXP(guild, member, xpadd, bot, settings, levelChannel);
	},
};

//Calculate needed xp
const getNeededXP = (level) => level * level * 100;

//Database calls
const addXP = async (guild, member, xpToAdd, bot, settings, levelChannel) => {
	try {
		const result = await xpSchema.findOneAndUpdate(
			{ guildid: guild.id, memberid: member.id },
			{
				guildid: guild.id,
				guildname: guild.name,
				memberid: member.id,
				membername: member.user.tag,
				$inc: {
					xp: xpToAdd,
				},
			},
			{
				upsert: true,
				new: true,
			}
		);

		let { xp, level } = result;
		const needed = getNeededXP(level);
		// console.log(bot.toThousands(needed));
		if (xp >= needed) {
			++level;
			xp -= needed;

			//Generate Embed
			const embed = new MessageEmbed()
				.setTitle('Level Up!')
				.setColor(settings.guildcolor)
				.setThumbnail(`${member.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`<:hypesquad:753802620342108161> Congratulations ${member.displayName}!\nYou are now level ${level}!`)
				.setFooter(`• Next Level› ${xp}/${bot.toThousands(getNeededXP(level))} •`);

			levelChannel.send({ embeds: [embed] });
		}

		await xpSchema.updateOne({ guildid: guild.id, memberid: member.id }, { level, xp });

		// console.log(result);
	} catch (err) {
		console.log(err);
	}
};
