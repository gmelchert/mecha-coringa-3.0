async function csgo_stats(message) {
    const [id, kills] = message.content.split(' ')
    const name = `kills: ${kills}`
    return await message.guild.roles.edit(id, { name })
        .then(updated => true)
        .catch(console.error)
}

export {
    csgo_stats
}