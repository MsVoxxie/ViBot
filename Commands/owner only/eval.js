/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const { createBar, Vimotes, permissions, isHex } = require('../../Storage/Functions/miscFunctions');

module.exports = {
	name: 'eval',
	aliases: [],
	description: 'Evaluates Code',
	example: '',
	category: 'owner only',
	args: true,
	cooldown: 0,
	hidden: false,
	ownerOnly: true,
	requiredRoles: [],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings) {
		function clean(text) {
			if (typeof text === 'string') {
				return text
					.replace(/`/g, '`' + String.fromCharCode(8203))
					.replace(/@/g, '@' + String.fromCharCode(8203));
			} else {
				return text;
			}
		}
		const hrStart = process.hrtime();
		// let hrDiff;
		const hrDiff = process.hrtime(hrStart);
		const code = args.join(' ');
		if (code.includes('token')) {
			message.reply('\nI will not share my token.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			return;
		}
		try {
			let evaled = eval(code);
			if (typeof evaled !== 'string') {
				evaled = require('util').inspect(evaled);
			}
			const codeEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: message.member.displayName})
				.setTitle('__**Success!**__')
				.setColor('#32a852')
				.addField('📥 Input:', `\`\`\`Javascript\n${code}\`\`\`\n`, false)
				.addField('📤 Output:', `\`\`\`Javascript\n${clean(evaled)}\`\`\``, false)
				.setFooter(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.`);
			message.channel.send({ embeds: [codeEmbed] });
		} catch (err) {
			const failedEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: message.member.displayName})
				.setTitle('__**Failed!**__')
				.setColor('#a83232')
				.addField('📥 Input:', `\`\`\`Javascript\n${code}\`\`\`\n`, false)
				.addField('📤 Output:', `\`\`\`Javascript\n${clean(err)}\`\`\``, false)
				.setFooter(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.`);
			message.channel.send({ embeds: [failedEmbed] });
		}
	},
};
