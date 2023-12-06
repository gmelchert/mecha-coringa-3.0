import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Volta a tocar música.'),

    async execute(interaction) {
        await interaction.reply('Voltando!')
        music.resume()
    }
}