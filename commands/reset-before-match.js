




import { SlashCommandBuilder } from "discord.js"
import { utilsDb } from "../database/utilsDb.js"

export default {
    data: new SlashCommandBuilder()
        .setName('reset-before-match')
        .setDescription('usar antes de puxar um comp no cs'),

    async execute(interaction) {
        const before_match = JSON.stringify({"mvps": 0, "kills": 0, "score": 0, "assist": 0, "deaths": 0})
        await interaction.reply('ok')

        const
            table = 'stats',
            values = { before_match }

         await utilsDb.put({
            table,
            values
        })
    }
}