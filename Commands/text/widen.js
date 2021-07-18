module.exports = {
	name: 'widen',
	aliases: ['wide'],
	description: 'W i  d   e    n',
	example: 'widen <text>',
	category: 'text',
	args: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		let wide = generateWideText(args.join(' '));

		if (wide >= 2000) {
			return message.channel.send(`${message.author}, your text is too long to be widened.`);
		}
		return message.channel.send(`**${wide}**`);
	},
};

function generateWideText(text) {
	let final = '';
	let space = '';
	let word = text.split('');

	word.forEach((letter) => {
		space += ' ';
		final += `${letter}${space}`;
	});

	return final;
}
