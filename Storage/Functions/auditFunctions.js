KickCheck = async function (member) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = member.guild;

			// Throw an error and reject the promise if the bot does not have sufficient permission
			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			// Grab the last audit log entry for kicks
			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: 'MEMBER_KICK',
			});

			// If No Result is found return a promise false
			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			// TODO: Check more than 1 entry, iteratie trought result to check if it was a kick.
			const FirstEntry = AuditLogFetch.entries.first();

			// If there is no entry made in the audit log in the last 5 seconds, resolve false as user was not kicked recently
			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			// If user was kicked return an object containing information
			const Info = {
				user: target.username,
				id: target.id,
				kickedby: executor.username,
				reason: FirstEntry.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	KickCheck,
};
