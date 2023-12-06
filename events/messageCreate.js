import { csgo_stats } from '../webhook/csgo_stats.js'

export default {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        try {
            if ((message.channelId !== '960007703181291560' && message.channelId !== '1016307829302382623')) return
            
            await csgo_stats(message)
            
                //await command.execute(interaction)
        } catch (error) {
            console.error(error)
            //await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
	},
}