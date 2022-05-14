const ms = require('ms');

module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot, Vimotes) {
		try {
			//Check if Bot
			if (message.author.bot) return;

			// Get Guild Settings
			const settings = await bot.getGuild(message.guild);
			const requiredPerms = ['MODERATE_MEMBERS', 'SEND_MESSAGES'];
			const msgLimit = settings.msglimit || 5;
			const msgTime = settings.msgtime || 5 * 1000;
			const punishmentDuration = settings.punishmentduration || 10 * 60 * 1000;
			const diffLimit = 2000;

			//Is this feature enabled?
			if (!settings.spamdetection) return;

			//Can I even moderate this member?
			if (!message.member.moderatable) return;

			//Check if in undesirables list
			if (bot.undesirables.has(message.author.id)) {
				const userData = bot.undesirables.get(message.author.id);
				const { lastMessage, timer } = userData;

				//Check message difference
				const difference = message.createdTimestamp - lastMessage.createdTimestamp;
				let msgCount = userData.msgCount;

				//Check if difference is greater than limit
				if (difference > diffLimit) {
					clearTimeout(timer);
					userData.msgCount = 1;
					userData.lastMessage = message;
					userData.timer = setTimeout(() => {
						bot.undesirables.delete(message.author.id);
					}, msgTime);
					bot.undesirables.set(message.author.id, userData);
				} else {
					//Increment message count
					++msgCount;

					//Member is spamming, do something about it!
					if (parseInt(msgCount) === msgLimit) {
						//Check for self permissions.
						const botmissing = !message.channel.permissionsFor(message.guild.me).has('MODERATE_MEMBERS');
						console.log(botmissing);
						if (botmissing) {
							//Get Log Channel, if any.
							const logChannel = await message.guild.channels.cache.get(settings.auditchannel);
							if (!logChannel) return;

							//Send to log channel, a warning.
							return logChannel
								.send({
									embeds: [
										bot.replyEmbed({
											color: bot.colors.warning,
											text: `${Vimotes['ALERT']} I am missing permissions!\nI'm missing the the permission: \`MODERATE_MEMBERS\`\nPlease give me this permission to use the anti-spam feature!`,
										}),
									],
								})
								.then((s) => {
									if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
								});
						}

						//Punishment here!
						try {
							console.log(`${message.author.tag} is spamming!`);
							await message.member.timeout(punishmentDuration, 'Spamming');
							message.reply({
								embeds: [
									bot.replyEmbed({
										color: bot.colors.warning,
										text: `${Vimotes['ALERT']} You are spamming and have been timed out for ${ms(punishmentDuration, { long: true })}!`,
									}),
								],
							});
						} catch (error) {
							// console.log(error);
						}

						//Remove the user from the undesirables list
						setTimeout(() => {
							//Remove them from whatever you did to them above.
							message.channel.send({
								embeds: [
									bot.replyEmbed({
										color: bot.colors.warning,
										text: `${Vimotes['CHECK']} ${message.member}, You're good to go again.`,
									}),
								],
							});
						}, punishmentDuration);
					} else {
						//Update user data
						userData.msgCount = msgCount;
						bot.undesirables.set(message.author.id, userData);
					}
				}
			} else {
				//Member is not spamming, do something about it!
				let fn = setTimeout(() => {
					bot.undesirables.delete(message.author.id);
				}, msgTime);

				//Reset user data
				bot.undesirables.set(message.author.id, {
					msgCount: 1,
					lastMessage: message,
					timer: fn,
				});
			}
		} catch (error) {
			console.log(error);
		}
	},
};
