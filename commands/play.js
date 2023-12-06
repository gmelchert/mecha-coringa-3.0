import { SlashCommandBuilder } from 'discord.js'
import { music } from './utilsMusic.js'

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Escolha uma música a ser tocada.')
        .addStringOption(opt => opt
            .setName('video')
            .setDescription('video a ser buscado')
            .setRequired(true)),
    
    async execute(interaction) {
        await interaction.reply('Beleza!')
        const args = interaction.options.getString('video')
        await music.play(interaction, args)
    }
}