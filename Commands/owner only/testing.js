const { MessageEmbed, MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// const URL = 'https://discord.com/assets/9f6f9cd156ce35e2d94c0e62e3eff462.png';
		// const attachment1 = new MessageAttachment(URL, `media.mp4`);
		// const attachment2 = new MessageAttachment(URL, `logo.png`);

		// const embed = new MessageEmbed().setImage(URL).setThumbnail(URL);

		// const msg = await message.channel.send({
		// 	content: URL,
		// 	files: [attachment1, attachment2],
		// 	embeds: [embed],
		// });
		const Choices = [];
		const Aether = {
			'[Aether] Adamantoise': 'Adamantoise',
			'[Aether] Cactuar': 'Cactuar',
			'[Aether] Faerie': 'Faerie',
			'[Aether] Gilgamesh': 'Gilgamesh',
			'[Aether] Jenova': 'Jenova',
			'[Aether] Midgarsormr': 'Midgarsormr',
			'[Aether] Sargatanas': 'Sargatanas',
			'[Aether] Siren': 'Siren',
		};
		const Crystal = {
			'[Crystal] Balmung': 'Balmung',
			'[Crystal] Brynhildr': 'Brynhildr',
			'[Crystal] Coeurl': 'Coeurl',
			'[Crystal] Diabolos': 'Diabolos',
			'[Crystal] Goblin': 'Goblin',
			'[Crystal] Malboro': 'Malboro',
			'[Crystal] Mateus': 'Mateus',
			'[Crystal] Zalera': 'Zalera',
		};
		const Primal = {
			'[Primal] Behemoth': 'Behemoth',
			'[Primal] Excalibur': 'Excalibur',
			'[Primal] Exodus': 'Exodus',
			'[Primal] Famfrit': 'Famfrit',
			'[Primal] Hyperion': 'Hyperion',
			'[Primal] Lamia': 'Lamia',
			'[Primal] Leviathan': 'Leviathan',
			'[Primal] Ultros': 'Ultros',
		};

		let Selection;
		const input = args.join(' ');
		switch (input.toLowerCase()) {
			case 'pether':
				Selection = Aether;
				break;
			case 'crystal':
				Selection = Crystal;
				break;
			case 'primal':
				Selection = Primal;
				break;
			default:
				Selection = Crystal;
				break;
		}

		for await (const [k, v] of Object.entries(Selection)) {
			Choices.push([
				{
					label: k,
					value: v,
				},
			]);
		}

		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu().setCustomId('selector').setPlaceholder('Select your Location').addOptions(Choices)
		);

		await message.channel.send({ content: 'Test', components: [row] });
	},
};
