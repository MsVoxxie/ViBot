const mongoose = require('mongoose');
const { Giveaways } = require('../Database/models');

module.exports = async (bot) => {


    const giveawayModel = await Giveaways;

    const { GiveawaysManager } = require('discord-giveaways');
    const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
        // This function is called when the manager needs to get all giveaways which are stored in the database.
        async getAllGiveaways() {
            // Get all giveaways from the database. We fetch all documents by passing an empty condition.
            return await giveawayModel.find().lean().exec();
        }

        // This function is called when a giveaway needs to be saved in the database.
        async saveGiveaway(messageId, giveawayData) {
            // Add the new giveaway to the database
            await giveawayModel.create(giveawayData);
            // Don't forget to return something!
            return true;
        }

        // This function is called when a giveaway needs to be edited in the database.
        async editGiveaway(messageId, giveawayData) {
            // Find by messageId and update it
            await giveawayModel.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
            // Don't forget to return something!
            return true;
        }

        // This function is called when a giveaway needs to be deleted from the database.
        async deleteGiveaway(messageId) {
            // Find by messageId and delete it
            await giveawayModel.deleteOne({ messageId }).exec();
            // Don't forget to return something!
            return true;
        }
    };

    // Create a new instance of your new class
    const manager = new GiveawayManagerWithOwnDatabase(bot, {
        default: {
            botsCanWin: false,
            embedColor: '#FF0000',
            embedColorEnd: '#000000',
            reaction: '🗳️',
            giveaway: '🗳️ ** RAFFLE STARTED ** 🗳️',
            giveawayEnded: '⚠️ **RAFFLE ENDED ** ⚠️',
            inviteToParticipate: 'React with 🗳️ to enter!',
            embedFooter: 'Good luck to everyone!',
        },
    });
    // We now have a giveawaysManager property to access the manager everywhere!
    bot.RaffleManager = manager;

}