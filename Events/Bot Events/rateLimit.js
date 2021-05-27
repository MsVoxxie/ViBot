module.exports = {
	name: 'rateLimit',
	disabled: false,
	once: false,
	async execute(info, bot) {
		console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout : 'Unknown timeout '}`);
	},
};