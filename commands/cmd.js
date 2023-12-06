import { SlashCommandBuilder, codeBlock } from "discord.js"
import { readdirSync } from 'node:fs'

async function getAllCommands() {
    const files = readdirSync('./commands').filter(file => 
        file.endsWith('.js') &&
        !file.startsWith('utils')
    ).map(file => `/${file.replace('.js', '')}`).join(' ')
    return files
}

export default {
    data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Mostra os comandos disponíveis.'),

    async execute(interaction) {
        await interaction.deferReply()
        const files = await getAllCommands()

        await interaction.editReply(codeBlock(files))
    }
}