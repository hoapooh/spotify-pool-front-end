export async function sendFakeNotification({ artistName }: { artistName: string }) {
	// This is a fake notification function that sends a notification to the Expo app
	const message = {
		to: "ExponentPushToken[HlxOOHGx-CVSBCcc384LjE]",
		sound: "default",
		title: "Track Upload",
		body: `${artistName} just uploaded a new track!`,
		data: { someData: "expo push notifications" },
	};

	await fetch("https://exp.host/--/api/v2/push/send", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Accept-encoding": "gzip, deflate",
			"Content-Type": "application/json",
		},
		mode: "no-cors",
		body: JSON.stringify(message),
	});
}
