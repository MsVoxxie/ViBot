const { MessageEmbed } = require('discord.js');
module.exports = (bot) => {

    //Audit Logging Embed
    bot.embedAudit = (data) => {
        if(!data) throw new Error('No data provided');
        const embed = new MessageEmbed()
        switch(data) {
            
        }
    }
};
