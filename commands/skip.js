import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pula para a próxima música.'),

    async execute(interaction) {
        try {
            await music.skip()
            await interaction.reply('Pulando...')
        } catch (err) {
            await music.stop()
            await interaction.reply('Sem mais na fila então, Abraço!')
        }
    }
}
