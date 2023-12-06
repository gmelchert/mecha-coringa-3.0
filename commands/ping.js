import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Devolve Pong!'),

    async execute(interaction) {
        await interaction.reply('Pong!')
    }
}