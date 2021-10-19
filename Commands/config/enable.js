module.exports = {
	name: 'enable',
	aliases: [],
	description: 'Enables a command Module for this guild.',
	example: 'enable Utility',
	category: 'config',
	args: true,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_GUILD'],
	async execute(bot, message, args, settings) {

		const category = args[0].toLowerCase();
		const Cats = bot.commands.map(c => {if(c.category !== 'owner only' && c.category !== 'config') return c.category;}).filter(x => x !== undefined);
		const botCats = await [...new Set(Cats)];
		if(category === 'config') return message.reply('The module `config` cannot be disabled, thus does not need to be enabled.');
		if(!botCats.includes(category)) return message.reply(`Invalid Module provided, here are the available modules: \`${botCats.join(', ')}\``).then((s) => {if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);});
		await bot.enableModule(message.guild, category);
		message.reply(`Successfully enabled the Module: \`${category}\``);

	},
};