module.exports = {
	name: 'disable',
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
		if(category === 'config') return message.lineReply('You cannot disable the `config` module due to it being required.');
		if(!botCats.includes(category)) return message.lineReply(`Invalid Module provided, here are the available modules: \`${botCats.join(', ')}\``).then((s) => {if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);});
		await bot.disableModule(message.guild, category);
		message.lineReply(`Successfully disabled the Module: \`${category}\``);

	},
};