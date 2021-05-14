const bot = require('../Vi');
const guildId = '230187047674052619';

const getApp = (guildId) => {
	const app = bot.api.applications(bot.user.id);
	if (guildId) {
		app.guilds(guildId);
	}
	return app;
};

// bot.ws.on('INTERACTION_CREATE', async (interaction) => {
// 	const { name, options } = interaction.data;
// });

async function CreateSlashCommand(cName, cDesc, cArgs) {
	await getApp(guildId).commands.post({
		data: {
			name: cName,
			description: cDesc,
			options: cArgs ? cArgs : [],
		},

	});
}

// Command Options
const commandOption = {
	name: '',
	description: '',
	required: false,
	type: 3,
	/* #region Types
        1: sub_command
        2: sub_command_group
        3: string
        4: integer
        5: boolean
        6: user
        7: channel
        8: role
        9: mentionable
        #endregion
    */
};

CreateSlashCommand('test', 'test command description', {
	name: 'help',
	description: 'help option description',
	required: false,
	type: 3,
});
