const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Events', 'Load Status');

module.exports = bot => {
	readdirSync('./Events/').forEach(dir => {
		const events = readdirSync(`./Events/${dir}/`).filter(file => file.endsWith('.js'));
		for(const file of events) {
			const pull = require(`../../Events/${dir}/${file}`);
			if(pull.name) {
				bot.events.set(pull.name, pull);
				if(!pull.disabled) {
					if(pull.once) {
						bot.once(pull.name, (...args) => pull.execute(...args, bot));
					}
					else{
						bot.on(pull.name, (...args) => pull.execute(...args, bot));
					}
					table.addRow(`${dir} | ${file}`, '✔ » Loaded');
				}
			}
			else {
				table.addRow(`${dir} | ${file}`, '❌ » Failed to Load!');
				continue;
			}
		}
	});
	console.log(table.toString());
};