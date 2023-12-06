import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName('homem').setDescription('homem'),
    async execute(interaction) {
        await interaction.reply('<@!407227008989265941>')
    }
}