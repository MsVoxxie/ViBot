module.exports = (bot) => {
	//Check for Media
	bot.hasMedia = async (message) => {
		let images = [];
		let videos = [];
		let embeds = [];
		let tweetData;
		const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/;
		const videoRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:mp4|gif|webm|mov)/;
		if (message.content.startsWith('https://twitter.com/')) {
			tweetData = await bot.getTweet(message.content);
		} else {
			if (videoRegex.test(message.content)) {
				videos.push(message.content);
			} else {
				// Image Check
				if (imageRegex.test(message.content)) {
					images.push(message.content);
				}
				// Video Check
				if (videoRegex.test(message.content)) {
					videos.push(message.content);
				}
				// Attachments
				if (message.attachments.size > 0 && images.length == 0) {
					message.attachments.map((a) => {
						//Image Check
						if (imageRegex.test(a.url)) {
							images.push(a.url);
						}
						//Video Check
						if (videoRegex.test(a.url)) {
							videos.push(a.url);
						}
					});
				}
				// Check for Embeds
				if (message.embeds.length > 0) {
					message.embeds.map((emb) => {
						console.log(emb);
						// Embed description
						if(emb.description) {
							embeds.push({ description: emb.description });
						}

						// Embed Image
						if(emb.image) {
							images.push(emb.image.url);
						}
					})
				}
			}
		}
		console.log({ images, videos, embeds, tweetData });
		return { images: images, videos: videos, embeds: embeds, tweetData: tweetData };
	};
};
