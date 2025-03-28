const axios = require("axios");

// Conversation history store karne ke liye (sirf last 5 messages) const conversationHistory = {}; let botMode = "off"; // Default mode off hai

module.exports.config = { name: "diba", version: "1.0.0", hasPermssion: 0, credits: "Custom by User", description: "Chatbot with Gemini AI", commandCategory: "ai", usages: "[ask]", cooldowns: 2, dependencies: { "axios": "1.4.0" } };

module.exports.run = async function ({ api, event, args, Users }) { const { threadID, messageID, senderID, body } = event; const query = args.join(" "); // User ka input const name = await Users.getNameUser(senderID); const adminUID = "YOUR_ADMIN_UID"; // Admin UID yahan dalen

// Mode control (+diba on/off/roast/romance)
if (body.startsWith("+diba")) {
    if (senderID !== adminUID) return api.sendMessage("Sirf admin mode control kar sakta hai!", threadID, messageID);
    
    const mode = body.split(" ")[1];
    if (mode === "on" || mode === "off" || mode === "roast" || mode === "romance") {
        botMode = mode;
        return api.sendMessage(`Diba mode updated: ${mode}`, threadID, messageID);
    }
    return;
}

// Bot off hai to reply na kare
if (botMode === "off") return;

if (!query) return api.sendMessage("Diba ko kuch poochna hai?", threadID, messageID);

api.sendMessage("Thinking...", threadID, messageID);

try {
    api.setMessageReaction("⌛", event.messageID, () => { }, true);

    // Gemini API Configuration
    const geminiApiKey = "AIzaSyD8AUi70sMMjKS6DP3x07Olku6oT-YgnFY";
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    // Conversation history ko include karein (sirf last 5 messages)
    if (!conversationHistory[threadID]) {
        conversationHistory[threadID] = [];
    }
    const previousConversation = conversationHistory[threadID];

    previousConversation.push({ role: "user", parts: [{ text: query }] });
    if (previousConversation.length > 5) previousConversation.shift();

    const response = await axios.post(geminiApiUrl, { contents: previousConversation }, {
        headers: { "Content-Type": "application/json" }
    });

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        let geminiResponse = response.data.candidates[0].content.parts[0].text;
        
        // Mode-based response modification
        if (botMode === "roast") {
            geminiResponse = `Roast mode: ${geminiResponse} 🤬`;
        } else if (botMode === "romance") {
            geminiResponse = `Romance mode: ${geminiResponse} ❤️`;
        }
        
        previousConversation.push({ role: "model", parts: [{ text: geminiResponse }] });
        if (previousConversation.length > 5) previousConversation.shift();

        api.sendMessage(geminiResponse, threadID, messageID);
        api.setMessageReaction("✅", event.messageID, () => { }, true);
    } else {
        throw new Error("Invalid response from API");
    }
} catch (error) {
    console.error('Error fetching response from Gemini:', error.response ? error.response.data : error.message);
    api.sendMessage(`Error: ${error.message}. Try again later.`, threadID, messageID);
}

};

