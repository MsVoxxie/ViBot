const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('addqueue').setType(3),
	async execute(bot, interaction, intGuild, intMember, intTarget, settings, Vimotes) {
		//Declarations
		const RegEx = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/gi;
		const Matches = [...intTarget.content.matchAll(RegEx)];
		const ytURL = Matches?.[0]?.[0];

		//Checks
		if (!ytURL) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['WARNING']} This is not a youtube link!`, }), ], ephemeral: true, });
        if(!intMember.voice.channel) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['WARNING']} You are not in a voice channel!`, }), ], ephemeral: true, });
        if(intGuild.me.voice.channel && intMember.voice.channel.id !== intGuild.me.voice.channel.id) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['WARNING']} You are not in the same voice channel as me!`, }), ], ephemeral: true, });

        //Try to find the song
        const Song = await bot.Music.search(ytURL, {
            requestedBy: intMember,
        });
        
         if(!Song.tracks[0]) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['STOP']} No Results!`, }), ], ephemeral: true, });
        
        //Set up queue
        const queue = await bot.Music.createQueue(intGuild, {
			leaveOnEnd: true,
			leaveOnEndCooldown: 90 * 1000,
			leaveOnStopCooldown: 90 * 1000,
			leaveOnEmptyCooldown: 30 * 1000,
			autoSelfDeaf: true,
			fetchBeforeQueued: true,
			enableLive: true,
			metadata: {
				message: intTarget,
				executor: intMember,
				channel: intMember.voice.channel,
				voice_channel: intMember.voice.channel,
			},
		});

        //Try to connect to voice channel.
        try {
			if (!queue.connection) await queue.connect(intMember.voice.channel);
		} catch (e) {
			await interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['STOP']} I was unable to connect to the voice channel!`, }), ], ephemeral: true, });
			return await queue.destroy();
		}

        //Add the song to the queue
        await intMember.voice.channel.send({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} ${intMember} Added song to queue!`, }), ], ephemeral: false, });
        await interaction.deferReply();
		await interaction.deleteReply();
		return await queue.play(Song.tracks[0]);
	},
};
