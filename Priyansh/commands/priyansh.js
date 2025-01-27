const fs = require("fs");

module.exports.config = {
	name: "priyansh",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝙋𝙧𝙞𝙮𝙖𝙣𝙨𝙝 𝙍𝙖𝙟𝙥𝙪𝙩", 
	description: "hihihihi",
	commandCategory: "no prefix",
	usages: "priyansh",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) { 
    console.log("User message received:", event.body); // Debugging

    var { threadID, messageID } = event;
    var userMessage = event.body.toLowerCase(); // Lowercase for better matching

    if (
        userMessage.indexOf("@rizwan ullah qureshi") == 0 || 
        userMessage.indexOf("rizwan") == 0 || 
        userMessage.indexOf("rizu") == 0 || 
        userMessage.indexOf("boss") == 0
    ) {
        var filePath = __dirname + `/noprefix/rizu.png`;

        // Check if file exists before sending
        if (!fs.existsSync(filePath)) {
            console.log("⚠️ File not found:", filePath);
            return api.sendMessage("⚠️ Rizu image file missing!", threadID, messageID);
        }

        var msg = {
            body: "Rizu ✨💖🥀",
            attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(msg, threadID, messageID);
        api.setMessageReaction("💔", messageID, (err) => {}, true);
    }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {};
