const fs = require("fs");
module.exports.config = {
    name: "women",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Responds when 'women' is mentioned",
    commandCategory: "no prefix",
    usages: "women",
    cooldowns: 5,
};

module.exports.handleEvent = function({ api, event }) {
    const { threadID, messageID, body } = event;

    // Convert message to lowercase for case-insensitive matching
    if (body && body.toLowerCase().includes("women")) {
        const msg = {
            body: "Hahaha Women 🤣",
            attachment: fs.createReadStream(__dirname + `/noprefix/wn.mp4`)
        };
        
        api.sendMessage(msg, threadID, messageID);
        api.setMessageReaction("☕", messageID, (err) => {}, true); // React with ☕ emoji
    }
};

module.exports.run = function() {
    // This function can remain empty as no prefix is required
};
