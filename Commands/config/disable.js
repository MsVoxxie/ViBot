module.exports = {
	name: 'disable',
	aliases: [],
	description: 'Disable a command Module for this guild.',
	example: 'disable Utility',
	category: 'config',
	args: true,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_GUILD'],
	async execute(bot, message, args, settings) {

		const category = args[0].toLowerCase();
		const Cats = bot.commands.map(c => {if(c.category !== 'owner only' && c.category !== 'config') return c.category;}).filter(x => x !== undefined);
		const botCats = await [...new Set(Cats)];
		if(category === 'config') return message.reply('You cannot disable the `config` module due to it being required.');
		if(!botCats.includes(category)) return message.reply(`Invalid Module provided, here are the available modules: \`${botCats.join(', ')}\``).then((s) => {if (settings.audit) setTimeout(() => s.delete(), 30 * 1000);});
		await bot.disableModule(message.guild, category);
		message.reply(`Successfully disabled the Module: \`${category}\``);

	},
};