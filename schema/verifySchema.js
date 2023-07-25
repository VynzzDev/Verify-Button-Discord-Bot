const { model, Schema } = require("mongoose");
const verifySchema = new Schema({
    Guild: String,
    VerifyRole: String,
    ChannelLog: String
});

module.exports = new model("verify", verifySchema);