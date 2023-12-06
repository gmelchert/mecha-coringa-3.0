import 'dotenv/config'

import { Client, Collection, GatewayIntentBits } from 'discord.js'
import config from './config.js'
import fs from 'node:fs'
import { DisTube } from 'distube'

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ] 
})
client.commands = new Collection()

// commands
const __dirname = './commands'
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.startsWith('utils'))

commandFiles.forEach(async file => {
    const { default: command } = await import(`${__dirname}/${file}`)
    client.commands.set(command.data.name, command)
})

// events
const eventsPath = './events'
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

eventFiles.forEach(async file => {
	const { default: event } = await import(`${eventsPath}/${file}`)

    event.once
        ? client.once(event.name, (...args) => event.execute(...args))
        : client.on(event.name, (...args) => event.execute(...args))
})

// functions
const functionsPath = './functions'
const functionsFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith('.js'))

functionsFiles.forEach(async file => {
	const { default: functions } = await import(`${functionsPath}/${file}`)
    functions(client)
})

client.login(config.token)
const distube = new DisTube(client, {
	leaveOnEmpty: false,
	leaveOnFinish: false,
	leaveOnStop: false,
})
export {
    distube,
    client
}



const array = [
    {
        nome: 'da'
    },
    {
        nome: 'aa'
    },
    {
        nome: 'co'
    },
    {
        nome: 'ab'
    },
];