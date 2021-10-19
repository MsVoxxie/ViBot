const ms = require('ms');

module.exports = {
    name: 'reroll',
    aliases: ['redo', 'reraf'],
    description: 'Reroll a raffles winner',
    example: "reroll messageid",
    category: 'raffles',
    args: true,
    cooldown: 15,
    hidden: false,
    ownerOnly: false,
    userPerms: ['SEND_MESSAGES'],
    botPerms: ['MANAGE_MESSAGES'],
    async execute(bot, message, args, settings, Vimotes) {

        // Declarations
        const messageID = args[0];

        // Checks
        if (!messageID) return message.lineReply('\nPlease provide a valid message ID of a previously ran raffle to reroll.').then((s) => {
            if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
        });

        // Do the reroll
        try {
            bot.RaffleManager.reroll(messageID);
            message.reply('\nRaffle Rerolled.').then((s) => {
                if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
            });
        }
        catch (e) {
            console.log(e);
        }
    },
};