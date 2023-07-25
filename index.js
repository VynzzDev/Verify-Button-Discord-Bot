// IMPORT MODULE
const fs = require("node:fs");
const path = require("node:path"); 
require("dotenv").config(); 
const { Client, Intents, Routes, REST, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});
const mongoose = require("mongoose");
const db_url = process.env.MONGO_URL;
const config = require("./config.json");

// LOAD SLASH COMMAND
const slash = [];
client.slash = new Collection();
const slashPath = path.join(__dirname, "slash");
const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"));
for(const count of slashFiles){
    const filePath = path.join(slashPath, count);
    const command = require(filePath);

    try{
        client.slash.set(command.data.name, command);
        slash.push(command.data.toJSON());   
        console.log(`✅ Loaded Slash Command: ${command.data.name}`);
    }catch(error){

    };
};

// INTERACTION CREATE
client.on("interactionCreate", async(interaction) => {
    if(!interaction.isCommand()) return;
    const command = client.slash.get(interaction.commandName);
    if(!command) return;
    try{
        if(!interaction.inGuild()) return interaction.reply({ content:"You can't run command in DMs!", ephemeral: true });
        await command.run(client, interaction);
    }catch(error){
        interaction.reply({ content:"An error occured while executing this command. Please try again later", ephemeral: true });
        console.log(`New Error While Executing Command: `, error);
    };
});

// MONGOOSE DATABASE HANDLE
if(!db_url){
    console.log("The mongodb url is not found. maybe forget to add or invalid variable name?");
    process.exit();
};
console.log(`🔃 Connecting to database...`);
mongoose.connect(db_url || '' , {
	keepAlive: true,
	useNewUrlParser: true,
	useUnifiedTopology: true
}).catch(error => {
    console.log("❌ Failed connect to databse. make sure your mongodb url is valid");
    process.exit();
});
mongoose.connection.on("connected", function(){
    console.log(`✅ Successfully connected to database`);
});

// REGISTRY COMMAND
client.on("ready", () => {
    client.user.setActivity({ name:`${config["activity-message"] || "Made by itzlynnn"}`, type: ActivityType.Competing });
    client.user.setStatus("online");
    const rest = new REST({ version: "10" }).setToken(token);
    (async() => {
        try{
            console.log(`🔃 Starting refreshing ${slash.length} application (/) commands`);
            rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: slash
            });
            console.log(`✅ Successfully reloaded ${slash.length} application (/) commands`);
        }catch(error){
            console.log("❌ Failed refreshing application (/) commands");
        };
    })();
    console.log(`⚒️  Logged as ${client.user.tag}`);
});

// LOGIN BOT
const token = process.env.TOKEN;
if(!token){
    console.log("The discord token is not found in .env, maybe forget to add or invalid variable name?");
    process.exit();    
};
client.login(token).catch(error => {
    console.log("The discord token is invalid. Maybe wrong token or the token has been revoked");
    process.exit();
});

// VERIFICATION SYSTEM
const verify = require("./schema/verifySchema");
client.on("interactionCreate", async(interaction) => {
    if(!interaction.isButton()) return;
    if(interaction.customId === "verify"){
        let data = await verify.findOne({ Guild: interaction.guild.id });
        let member = interaction.member;
        if(!data){
            return interaction.reply({ content:"Sorry, seems like this server no have verification system setup. Please ask admin of the server or owner for setup verification system", ephemeral: true });
        }else{
            let channel = data.ChannelLog;
            let role = data.VerifyRole;
            let checkrole = interaction.guild.roles.cache.get(role);
            let bot = interaction.guild.members.cache.get(client.user.id);
            if(!checkrole){
                return interaction.reply({ content:"Sorry, seems like this server no have valid verified role. Please ask admin of the server or owner for setup verification system", ephemeral: true });
            }
            if(member.roles.cache.has(role)){
                return interaction.reply({ content:"You already verified in this server!", ephemeral: true });
            }else{
                if(bot.roles.highest.comparePositionTo(checkrole) <= 0){
                     return interaction.reply({ content:"Sorry, seems like i can't assign verified role because the role is higher than my role. Please ask admin of the server or owner for resetup verification system", ephemeral: true });
                }
                member.roles.add(checkrole);
                interaction.reply({ content:"You have been verified!", ephemeral: true });
                if(channel){
                    let embed = new EmbedBuilder()
                        .setAuthor({ name:`${interaction.guild.name}`, iconURL:`${interaction.guild.iconURL({ dynamic: true })}` })
                        .setTitle("Member Verified")
                        .setDescription(`**${interaction.user.tag}** (\`${interaction.user.id}\`) has successfully verified in this server`)
                        .setTimestamp()
                        .setFooter({ text:`${interaction.user.tag}`, iconURL:`${interaction.user.displayAvatarURL({ dynamic: true })} `})
                        .setColor("Orange")
                    client.channels.cache.get(channel).send({ embeds: [embed ]}).catch(error => {
                        return;
                    });
                }
            }
        }
    }
})