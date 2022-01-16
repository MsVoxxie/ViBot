const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: 'Enable slowmode for a set period of time.',
	example: 'slowmode 5 1h',
	category: 'moderation',
	args: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const timeout = parseInt(args[0]);
		const duration = ms(args[1]);

		//Check if a time was given
		if (isNaN(timeout))
			return message.reply(`Please specify a time to set the slowmode to.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		if (timeout > 30)
			return message.reply(`Please specify a time less than 30 seconds.`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});

		//Do It
		await message.channel.setRateLimitPerUser(timeout, `Command Executed by ${message.author.tag}`);

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setTitle(`Slowmode Enabled`)
			.setDescription(`Slowmode has been enabled for \`${timeout} seconds\`. with a duration of \`${ms(duration, { long: true })}\``)
			.setFooter({ text: `Command Executed by ${message.author.tag}` });
		const msg = await message.channel.send({ embeds: [embed] });

		setTimeout(async () => {
			await message.channel.setRateLimitPerUser(0, `Command Executed by ${message.author.tag} has expired.`);
			await msg.delete();
		}, duration);
	},
};
