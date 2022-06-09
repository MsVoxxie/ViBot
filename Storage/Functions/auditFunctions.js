AuditCheck = async function (data, AuditType) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = data.guild;

			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: AuditType,
			});

			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			const FirstEntry = AuditLogFetch.entries.first();

			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			const Info = {
				target: target?.username,
				id: target?.id,
				executor: executor,
				reason: FirstEntry?.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	AuditCheck,
};
