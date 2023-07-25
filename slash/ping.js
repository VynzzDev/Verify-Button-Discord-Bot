const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get bot's latency ping"),
    run: async(client, interaction) => {
        let embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`🏓 **Pong!** \`${client.ws.ping}\` ms`)
            .setTimestamp()
            .setFooter({ text:`${interaction.user.tag}`, iconURL:`${interaction.user.displayAvatarURL({ dynamic: true })}`})
        await interaction.reply({ embeds: [embed] });
    }
}