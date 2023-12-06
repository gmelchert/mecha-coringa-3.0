import { Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import config from './config.js'
import { readdirSync } from 'node:fs'

const { clientId, guildId, token } = config

const commands = []
const __dirname = './commands'

const commandFiles = readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.startsWith('utils'))

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    await Promise.all(commandFiles.map(async file => {
        const { default: command } = await import(`${__dirname}/${file}`)
        commands.push(command?.data.toJSON())
    }))

    try {
        //console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        )

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        process.exit(1)
    } catch (error) {
        //console.error(error);
    }
})()