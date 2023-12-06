import { SlashCommandBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Atualiza todos os comandos!'),

    async execute(interaction) {
        await interaction.deferReply()
        await import('../deploy-commands.js')
        await interaction.editReply('Comandos Atualizados!')
        process.exit(1)
    }
}