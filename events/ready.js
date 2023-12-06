export default {
	name: 'ready',
	once: true,
	execute(client) {
        client.user.setActivity("Lutando contra a ditadura III")
		console.log(`Ready! Logged in as ${client.user.tag}`)
	},
}