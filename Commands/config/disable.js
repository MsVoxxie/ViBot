module.exports = {
	name: 'disable',
	description: 'Disable a command Module for this guild.',
	example: 'disable Utility',
	category: 'config',
	args: true,
	hidden: false,
	ownerOnly: false,
	userPerms: ['ADMINISTRATOR'],
	async execute(bot, message, args, settings) {

		const category = args[0].toLowerCase();
		const botCats = bot.commands.map(c => {if(c.category !== 'owner only' && c.category !== 'config') return c.category;}).filter(x => x !== undefined);
		if(category === 'config') return message.lineReply('You cannot disable the `config` module due to it being required.');
		if(!botCats.includes(category)) return message.lineReply(`Invalid Module provided, here are the available modules: \`${botCats.join(', ')}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		await bot.disableModule(message.guild, category);
		message.lineReply(`Successfully disabled the Module: \`${category}\``);

	},
};