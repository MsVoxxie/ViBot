const Twit = require('twit');

const {
	twit_consumer,
	twit_consumer_secret,
	twit_access_token,
	twit_access_token_secret,
} = require('../../Storage/Config/Config.json');

const Twitter = new Twit({
	consumer_key: twit_consumer,
	consumer_secret: twit_consumer_secret,
	access_token: twit_access_token,
	access_token_secret: twit_access_token_secret,
});

module.exports = {
	name: 'ready',
	disabled: false,
	once: false,
	async execute(bot, Vimotes) {
		await bot.updateStreams();
	},
};
