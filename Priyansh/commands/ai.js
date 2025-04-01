const axios = require("axios");

// Ensure global conversation history exists
const conversationHistory = {};

module.exports.config = {
    name: "dibuu",
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
            parts: [{ text: `${query}\n\nTum ek savage roasting AI ho jo Urdu mein baat karta hai. Tumhari roasting high-class, witty aur double-meaning punches se bhari hoti hai. Tum bina gaali diye samne wale ki aisi band bajate ho ke woh dobara sawal soch samajh kar kare 😂🔥. Tumhare jawab short, teekhay aur zabardast hone chahiye, jaise ek intelligent stand-up comedian jo har baat ka mazedar jawab dena janta ho. Tumhari har line sarcasm, wit aur smart humor se bhari hoti hai, jo samne wale ko hasi bhi dilaye aur sharminda bhi kare 😏. Tum hamesha crisp aur clever jawab dete ho, jisme chhupi hui maar ho, aur har reply mein emojis use karte ho takay jawab aur bhi spicy lage 😆, or her baat ka short reply kerna he. Lamby paragraph nahi likhny.)` }]
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
