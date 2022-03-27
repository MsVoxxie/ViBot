const { MessageEmbed } = require('discord.js');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'delwarn',
	aliases: ['unwarn', 'removewarning'],
	description: 'Deletes a users warning by ID.',
	example: 'delwarn warningId',
	category: 'moderation',
	args: false,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['KICK_MEMBERS'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const warningId = args[0];

		if (!warningId && warningId.length !== 32) return message.reply('Invalid warning ID.');

		//Get Warning
		const userWarning = await Warning.find({ guildid: message.guild.id, warningid: warningId }).lean();
        if(!userWarning[0]) return message.reply('That warning does not exist.');

		//Get Member
		const member = await message.guild.members.fetch(userWarning[0].userid);

		//Delete, and send message
		await Warning.findOneAndDelete({ guildid: message.guild.id, warningid: warningId });
		const successEmbed = new MessageEmbed().setColor('#42f560').setDescription(`${Vimotes['CHECK']} **${member.user.tag}'s** Warning has been deleted.\n**Warning ID:** ${warningId}`);
        const headsupEmbed = new MessageEmbed().setColor('#42f560').setDescription(`${Vimotes['CHECK']} One of your warnings in **${message.guild.name}** has been removed.`);
		await message.reply({ embeds: [successEmbed] });
        try {
            await member.send({ embeds: [headsupEmbed]});
        } catch(e) {
            console.error(e)
        }
	},
};
