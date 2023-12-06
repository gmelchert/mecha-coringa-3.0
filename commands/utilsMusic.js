import { distube } from '../index.js'
import config from '../config.js'

distube.on("addSong", (queue, song) => queue.textChannel.send(
    `Adicionado ${song.name} - \`${song.formattedDuration}\` para a fila pelo ${song.user}.`
))

class Music {
    async play(interaction, args) {
        return await distube.play(interaction.member.voice.channel, args, {
            interaction,
            textChannel: interaction.channel,
            member: interaction.member,
        }).catch(async err => {
            console.log(err)
            //await interaction.reply('err.message');
        })
    }

    skip() {
        return distube.skip(config.guildId)
    }

    stop() {
        return distube.stop(config.guildId)
    }

    resume() {
        return distube.resume(config.guildId)
    }

    pause() {
        return distube.pause(config.guildId)
    }

    queue() {
        const queue = distube.getQueue(config.guildId)
        const message = 'Fila atual:\n' + queue.songs.map((song, id) =>
            `**${id+1}**. [${song.name}] - \`${song.formattedDuration}\``
        ).join("\n")
        return message
    }

    //async playlist(interaction) {
    //    new Distube.Playlist()
    //}
}

 

export const music = new Music()