const { Reaction, userData } = require('../../Storage/Database/models/');
const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'messageReactionAdd',
	disabled: false,
	once: false,
	async execute(msg, user, bot, Vimotes) {
		if (msg.message.partial) {
			await msg.message.fetch();
		}
		if (user.bot) return;
		const fetchReactions = await Reaction.find({
			guildid: msg.message.guild.id,
			messageid: msg.message.id,
			channelid: msg.message.channel.id,
			reaction: msg.emoji.name,
		}).lean();
		const getReactions = fetchReactions[0]; // This is a horrible way to do this. Too bad!

		//Checks
		if (!getReactions) return;
		if (msg.emoji.name.toString() !== getReactions.reaction) return console.log('Reaction is not the same');
		const Role = await msg.message.guild.roles.cache.get(getReactions.roleid);
		const member = await msg.message.guild.members.cache.get(user.id);
		const uData = await userData.findOne({ guildid: msg.message.guild.id, userid: user.id });

		//Check if the user has the role
		if (!member.roles.cache.has(Role.id)) {
			try {
				await member.roles.add(Role);
				if(uData?.receivedm === false) return;
					await member.send({ embeds: [bot.replyEmbed({ color: '#42f560', text: `${Vimotes['ADDED']} **»** You have been assigned the role ***${Role.name}***`, footer: `Guild» ${msg.message.guild.name}` })] });
				
			} catch (e) {
				member.send({ embeds: [bot.replyEmbed({ color: '#f54242', text: `${Vimotes['INFO']} **»** I was unable to assign the role ***${Role.name}***`, footer: `Guild» ${msg.message.guild.name}` })] });
			}
		} else {
			try {
				await member.roles.remove(Role);
				if(uData?.receivedm === false) return;
					await member.send({ embeds: [bot.replyEmbed({ color: '#42f560', text: `${Vimotes['REMOVED']} **»** You have been removed from the role ***${Role.name}***`, footer: `Guild» ${msg.message.guild.name}` })] });
				
			} catch (e) {
				member.send({ embeds: [bot.replyEmbed({ color: '#f54242', text: `${Vimotes['INFO']} **»** I was unable to assign the role ***${Role.name}***`, footer: `Guild» ${msg.message.guild.name}` })] });
			}
		}

		//Remove the reaction
		const userReaction = await msg.message.reactions.cache.get(msg.emoji.name);
		await userReaction.users.remove(user.id);
	},
};
