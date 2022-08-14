/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const vm = require('vm');

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
	userPerms: [],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		function clean(text) {
			if (typeof text === 'string') {
				return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
			} else {
				return text;
			}
		}
		let wasAsync = false;
		const hrStart = process.hrtime();
		const hrDiff = process.hrtime(hrStart);
		const code = args.join(' ');
		const runThis = `(async () => {return ${code}})()`;
		if (code.includes('token')) {
			message.reply('\nI will not share my token.').then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
			return;
		}

		//Was this an await execution?
		if (code.includes('await')) wasAsync = true;
		// let awaitString = `Asyncrhonous Execution: ${wasAsync}`; // This feels a bit overkill.
		// const wrapLines = '─'.repeat(awaitString.length); // This feels a bit overkill.

		try {
			//Switch to much safer Virtual Machine code execution.
			const evaled = await vm.runInNewContext(runThis, {
				bot,
				message,
				args,
				settings,
				Vimotes,
				console,
			});

			const codeEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: message.member.displayName })
				.setTitle('__**Success!**__')
				.setColor('#32a852')
				.addField('📥 Input:', `\`\`\`Javascript\n${code}\`\`\`\n`, false)
				.addField('📤 Output:', `\`\`\`Javascript\n${clean(evaled)}\`\`\``, false)
				// .addField('Async', `\`\`\`Javascript\n${wrapLines}\n${awaitString}\n${wrapLines}\`\`\``, false) // This feels a bit overkill.
				.setFooter({ text: `Async: ${wasAsync} • Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms` });
			message.channel.send({ embeds: [codeEmbed] });
		} catch (err) {
			console.trace(err);
			const failedEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: message.member.displayName })
				.setTitle('__**Failed!**__')
				.setColor('#a83232')
				.addField('📥 Input:', `\`\`\`Javascript\n${code}\`\`\`\n`, false)
				.addField('📤 Output:', `\`\`\`Javascript\n${clean(err)}\`\`\``, false)
				.setFooter({ text: `Async: ${wasAsync} • Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms` });
			message.channel.send({ embeds: [failedEmbed] });
		}
	},
};
