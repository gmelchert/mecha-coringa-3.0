import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Encerra a fila.'),

    async execute(interaction) {
        await music.stop()
        await interaction.reply('Abraço!')
    }
}