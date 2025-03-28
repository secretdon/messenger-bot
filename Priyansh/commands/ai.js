const axios = require("axios");

// Conversation history store karne ke liye (sirf last 5 messages) const conversationHistory = {}; const botModes = {}; // Bot modes store karne ke liye (normal/roast) const adminUID = "YOUR_ADMIN_UID"; // Yahan apni admin UID daalain

module.exports.config = { name: "babu", version: "1.0.0", hasPermssion: 0, credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭", description: "Google Cloud AI (Gemini) with Roasting Mode", commandCategory: "ai", usages: "[ask]", cooldowns: 2, dependencies: { "axios": "1.4.0" } };

module.exports.run = async function ({ api, event, args, Users }) { const { threadID, messageID, senderID } = event; const query = args.join(" "); const name = await Users.getNameUser(senderID);

// Bot modes handle karna
if (query.toLowerCase() === "+diba roast" && senderID === adminUID) {
    botModes[threadID] = "roast";
    return api.sendMessage("🔥 Roasting mode activated! Ab bot har jawab roast style me dega.", threadID, messageID);
}
if (query.toLowerCase() === "+diba off" && senderID === adminUID) {
    botModes[threadID] = "off";
    return api.sendMessage("🛑 Bot off kar diya gaya hai. Ab koi response nahi dega.", threadID, messageID);
}
if (query.toLowerCase() === "+diba on" && senderID === adminUID) {
    botModes[threadID] = "normal";
    return api.sendMessage("✅ Bot wapas on ho gaya hai! Normal mode me jawab dega.", threadID, messageID);
}

if (botModes[threadID] === "off") return;

if (!query) return api.sendMessage("babu btaao aap ka babu kia help ker sakta aap ki....", threadID, messageID);
api.sendMessage("Searching for an answer, please wait...", threadID, messageID);

try {
    api.setMessageReaction("⌛", event.messageID, () => { }, true);

    const geminiApiKey = "AIzaSyD8AUi70sMMjKS6DP3x07Olku6oT-YgnFY";
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    if (!conversationHistory[threadID]) {
        conversationHistory[threadID] = [];
    }
    const previousConversation = conversationHistory[threadID];

    // Agar roasting mode hai to query modify karein
    let finalQuery = query;
    if (botModes[threadID] === "roast") {
        finalQuery = `Tum aik savage roaster ho, mazaak or thoda sarcastic tone use karo. Ye raha user ka input: ${query}`;
    }

    previousConversation.push({ role: "user", parts: [{ text: finalQuery }] });

    if (previousConversation.length > 5) {
        previousConversation.shift();
    }

    console.log("Sending request to Gemini API with:", previousConversation);

    const response = await axios.post(geminiApiUrl, { contents: previousConversation }, { headers: { "Content-Type": "application/json" } });

    console.log("Received response from Gemini API:", response.data);

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const geminiResponse = response.data.candidates[0].content.parts[0].text;

        previousConversation.push({ role: "model", parts: [{ text: geminiResponse }] });
        if (previousConversation.length > 5) {
            previousConversation.shift();
        }

        api.sendMessage(geminiResponse, threadID, messageID);
        api.setMessageReaction("✅", event.messageID, () => { }, true);
    } else {
        throw new Error("Invalid response from API");
    }
} catch (error) {
    console.error('Error fetching response from Gemini:', error.response ? error.response.data : error.message);
    api.sendMessage(`An error occurred: ${error.message}. Please try again later.`, threadID, messageID);
}

};

