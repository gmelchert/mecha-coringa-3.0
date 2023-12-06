import { SlashCommandBuilder } from "discord.js"
import { utilsDb } from "../database/utilsDb.js"

export default {
    data: new SlashCommandBuilder()
        .setName('csgo-rank')
        .setDescription('Rank por Stat')
        .addStringOption(option =>
            option.setName('stat')
                .setDescription('Stat a ser ranqueado')
                .setRequired(true)
                .addChoices(
                    { name: 'kills', value: 'kills' },
                    { name: 'deaths', value: 'deaths' },
                    { name: 'mvps', value: 'mvps' },
                    { name: 'score', value: 'score' },
                )),

    async execute(interaction) {
        await interaction.deferReply()
        const col = await interaction.options.getString('stat')

        const
            table = 'stats',
            orderBy = `${col} DESC`

        const rows = await utilsDb.get({
            table,
            orderBy
        }).then(result => result.rows)
        .catch(err => console.log(err))

        const message = rows.map((e, i) => `***${i+1}.***   | k: ${e.kills} | a: ${e.assist} | d: ${e.deaths} | m: ${e.mvps} | s: ${e.score}   |  kd: ${(Number(e.kills) / Number(e.deaths)).toFixed(2)}  |  <@!${e.idDiscord}>`).join('\n\n')

        await interaction.editReply(message)
    }
}