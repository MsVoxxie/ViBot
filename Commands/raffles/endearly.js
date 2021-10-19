const ms = require('ms');

module.exports = {
    name: 'endearly',
    aliases: ['end', 'rafend'],
    description: 'End a raffle early',
    example: "endearly messageid",
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
        if (!messageID) return message.lineReply('\nPlease provide a valid message ID of a previously ran raffle to end.').then((s) => {
            if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
        });

        // Do the reroll
        try {
            bot.RaffleManager.end(messageID);
            message.reply('\nRaffle Ended.').then((s) => {
                if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
            });
        }
        catch (e) {
            console.log(e);
        }
    },
};