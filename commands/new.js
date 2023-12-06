import { SlashCommandBuilder } from "discord.js";
import { writeFile } from "fs/promises";

async function writeJsFile(command, answer) {
    try {
        const content = 
`import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName('${command}').setDescription('${command}'),
    async execute(interaction) {
        await interaction.reply('${answer}')
    }
}`
        return await writeFile(`./commands/${command}.js`, content);
    } catch (err) {
        return console.log(err)
    }
}


export default {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Gera um novo comando!')
        .addStringOption(op => op
            .setName('comando')
            .setDescription('O nome do seu comando.')
            .setRequired(true))
        .addStringOption(op => op
            .setName('resposta')
            .setDescription('A resposta do seu comando')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const command = interaction.options.getString('comando')
        const response = interaction.options.getString('resposta')
        await writeJsFile(command, response)
        await interaction.editReply('Da um /refresh e testa o comando.')
    }
}