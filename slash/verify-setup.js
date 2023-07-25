const { SlashCommandBuilder, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField } = require("discord.js");
const verify = require("../schema/verifySchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify-setup")
        .setDescription("Setup verification system")
        .addRoleOption(option => option.setName("role").setDescription("This role will given to members when members success verify").setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel where verification embed will sent").addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addChannelOption(option => option.setName("logging").setDescription("The channel where all verify will notify").addChannelTypes(ChannelType.GuildText)),
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            return interaction.reply({ content:"`❌` You don't have permission to use this command", ephemeral: true });
        }
        let role = interaction.options.getRole("role");
        let channel = interaction.options.getChannel("channel");
        let logging = interaction.options.getChannel("logging");
        let data = await verify.findOne({ Guild: interaction.guild.id });
        let embed = new EmbedBuilder()
            .setAuthor({ name:`${interaction.guild.name}`, iconURL:`${interaction.guild.iconURL({ dynamic: true })}` })
            .setColor("Green")
            .setDescription("Click verify button below to get Verified Roles!")
        let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("verify")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("✅")
                    .setLabel("Verify")
            )
        if(data){
            interaction.reply({ content:"Sorry, Seems you already setup verification system in this server. Please /verify-disable then run this command again", ephemeral: true });
        }else{
            if(logging){
                await verify.create({ Guild: interaction.guild.id, VerifyRole: role.id, ChannelLog: logging.id });
                channel.send({ embeds: [embed], components: [button] });
                interaction.reply({ content:"Your verification system has setup successfully", ephemeral: true });
            }else{
                await verify.create({ Guild: interaction.guild.id, VerifyRole: role.id });
                channel.send({ embeds: [embed], components: [button] });
                interaction.reply({ content:"Your verification system has setup successfully", ephemeral: true });
            }
        }
    }
}