import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Para de tocar a música.'),
    
    async execute(interaction) {
        await interaction.reply('Pausando...')
        music.pause()
    }
}