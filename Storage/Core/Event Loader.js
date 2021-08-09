const { readdirSync } = require('fs');
const path = require('path');
const ascii = require('ascii-table');
const eventTable = new ascii().setHeading('Events', 'Load Status', 'Run Type');
const musicTable = new ascii().setHeading('Music Events', 'Load Status');
const { Vimotes } = require('../Functions/miscFunctions');

module.exports = (bot) => {
	// Load Events
	readdirSync('./Events/').forEach((dir) => {
		const events = readdirSync(`./Events/${dir}/`).filter((file) => file.endsWith('.js'));
		for (const file of events) {
			const pull = require(`../../Events/${dir}/${file}`);
			if (pull.name) {
				bot.events.set(pull.name, pull);
				if (!pull.disabled) {
					if (pull.once) {
						bot.once(pull.name, (...args) => pull.execute(...args, bot, Vimotes));
						eventTable.addRow(`${dir} | ${file}`, '✔ » Loaded', '«  Once  »');
					} else {
						bot.on(pull.name, (...args) => pull.execute(...args, bot, Vimotes));
						eventTable.addRow(`${dir} | ${file}`, '✔» Loaded', '«Infinite»');
					}
				}
			} else {
				eventTable.addRow(`${dir} | ${file}`, '❌» Failed to Load!');
				continue;
			}
		}
	});

	// Load Music Bot Triggers
	const player = readdirSync(path.join(__dirname, '../Functions/MusicBot/Events/')).filter((file) => file.endsWith('.js'));

	for (const file of player) {
		try {
			const play = require(path.join(__dirname, '../Functions/MusicBot/Events/', file));
			bot.Music.on(file.split('.')[0], play.bind(null, bot));
			musicTable.addRow(`${file.split('.')[0]}`, '✔ » Loaded');
		} catch (error) {
			musicTable.addRow(`${file.split('.')[0]}`, '❌ » Failed to Load!');
		}
	}
	console.log(eventTable.toString());
	console.log(musicTable.toString());
};
