import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName('zero').setDescription('zero'),
    async execute(interaction) {
        await interaction.reply('Zé!')
    }
}