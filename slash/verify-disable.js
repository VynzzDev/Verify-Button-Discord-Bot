const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const verify = require("../schema/verifySchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify-disable")
        .setDescription("Disable verification system in this server"),
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            return interaction.reply({ content:"`❌` You don't have permission to use this command", ephemeral: true });
        }
        let data = await verify.findOne({ Guild: interaction.guild.id });
        if(!data){
            interaction.reply({ content:"Sorry, Seems you no have setup verification system in this server", ephemeral: true });
        }else{
            await verify.deleteMany({ Guild: interaction.guild.id });
            return interaction.reply({ content:"Verification system has disabled successfully", ephemeral: true });
        }
    } 
}