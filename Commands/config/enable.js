module.exports = {
	name: 'enable',
	description: 'Enables a command Module for this guild.',
	example: 'enable Utility',
	category: 'config',
	args: true,
	hidden: false,
	ownerOnly: false,
	userPerms: ['ADMINISTRATOR'],
	async execute(bot, message, args, settings) {

		const category = args[0].toLowerCase();
		const botCats = bot.commands.map(c => {if(c.category !== 'owner only' && c.category !== 'config') return c.category;}).filter(x => x !== undefined);
		if(category === 'config') return message.lineReply('The module `config` cannot be disabled, thus does not need to be enabled.');
		if(!botCats.includes(category)) return message.lineReply(`Invalid Module provided, here are the available modules: \`${botCats.join(', ')}\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});
		await bot.enableModule(message.guild, category);
		message.lineReply(`Successfully enabled the Module: \`${category}\``);

	},
};