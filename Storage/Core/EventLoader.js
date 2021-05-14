const { readdirSync } = require('fs');
module.exports.setup = bot => {
	// Read Events folder
	const eventFiles = readdirSync('./Events').filter(file => file.endsWith('.js'));
	// Iterate over each file
	for(const file of eventFiles) {
		const event = require(`../../Events/${file}`);
		// If the event is disabled return
		if(event.disabled === true) { return; }
		if(event.once) {
			bot.once(event.name, (...args) => event.execute(...args, bot));
		}
		else{
			bot.on(event.name, (...args) => event.execute(...args, bot));
		}
	}
};