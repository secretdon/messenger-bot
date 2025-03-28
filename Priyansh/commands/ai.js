const axios = require("axios");

// Ensure global conversation history exists
const conversationHistory = {};

module.exports.config = {
    name: "diba",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Google Cloud AI (Gemini) by Priyansh",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    const name = await Users.getNameUser(senderID);

    if (!query) return api.sendMessage("btaao bachy keun bulaya appun ko 😶‍🌫️😊....", threadID, messageID);

    try {
        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        // Gemini API Configuration
        const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA"; // Apni Gemini API key yahan dalen
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        // Ensure conversation history for the thread exists
        if (!conversationHistory[threadID]) {
            conversationHistory[threadID] = [];
        }
        const previousConversation = conversationHistory[threadID];

        // Add user message
        previousConversation.push({
            role: "user",
            parts: [{ text: `${query}\n\n( tumhara naam Diba he. or koi tum se poochy ke tumhey kis ne bnaya he to tum ne kehna he ke mujy Rizwan me bnaya he. Tum ek mazedar roasting chatbot ho jo user ke har sawal ka mazedar aur roasting  jawab dete ho.. tum emojies ka use ziada kero ge msg ko attractive dikhaany ke liey. Tumhara maqsad sirf mazak karna hai, na ke kisi ka dil dukhana!, or har message ka short jawab do ge. ziada lamba na ho )` }]
        });

        // Keep only last 5 messages
        if (previousConversation.length > 5) {
            previousConversation.shift();
        }

        console.log("Sending request to Gemini API with:", previousConversation);

        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Received response from Gemini API:", response.data);

        // Validate response
        if (response.data && response.data.candidates && response.data.candidates.length > 0 && response.data.candidates[0].content.parts.length > 0) {
            const geminiResponse = response.data.candidates[0].content.parts[0].text;

            // Add bot response to history
            previousConversation.push({
                role: "model",
                parts: [{ text: geminiResponse }]
            });

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
