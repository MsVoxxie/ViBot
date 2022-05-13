const { nanoid } = require('nanoid');
const { MessageEmbed } = require('discord.js');
const { Reaction } = require('../../Storage/Database/models/');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reactionroles')
		.setDescription('Create reaction roles.')
		.addStringOption((option) => option.setName('messagelink').setDescription('The message link you want to create a reaction role for.').setRequired(true))
		.addRoleOption((option) => option.setName('role').setDescription('The role you want to use.').setRequired(true))
		.addStringOption((option) => option.setName('emoji').setDescription('The emoji you want to use.').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_ROLES'],
		botPerms: ['MANAGE_ROLES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings) {

        //Check for valid options
        if(!interaction.options.getString('messagelink').startsWith('https://discord.com/channels/')) return interaction.reply({ content: 'The message link you provided is not a valid message link.', ephemeral: true });
        const emojiTest = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
		if(emojiTest.test(interaction.options.getString('emoji')) === false) return interaction.reply({ content: 'The emoji you provided is not a valid emoji.', ephemeral: true });

        // Get the message
        const msgLink = interaction.options.getString('messagelink').split('/').slice(5);
        const msgChan = await intGuild.channels.fetch(msgLink[0]);
        const msg = await msgChan.messages.fetch(msgLink[1]);

		//Create unique identifier
		const identifier = nanoid(8);

       //Database Info
        await Reaction.create({
			guildid: intGuild.id,
			messageid: msg.id,
			channelid: msgChan.id,
			roleidentifier: identifier,
			roleid: interaction.options.getRole('role').id,
			reaction: interaction.options.getString('emoji'),
		});

		//Add reaction to message
		await msg.react(interaction.options.getString('emoji'));

		//Create Embed
		const embed = new MessageEmbed()
			.setTitle('Reaction Role Created')
			.setDescription(`Reaction ID› \`${identifier}\`\nEmoji› ${interaction.options.getString('emoji')}\nRole› ${interaction.options.getRole('role')}\nChannel› ${msg.channel}\nMessage Link› [Jump To Message](${msg.url})`)
			.setColor(settings.guildcolor);

		await interaction.reply({ embeds: [embed] });

	},
};
