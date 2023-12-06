import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Visualizar a queue.'),

    async execute(interaction) {
        const queue = music.queue()
        await interaction.reply(queue)
    }
}