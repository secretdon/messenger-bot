const axios = require("axios");

// Global conversation history object
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

    if (!query) return api.sendMessage("👋 jaldi bolo keun yaad kia appun ko ? 🥳🏈", threadID, messageID);

    try {
        api.setMessageReaction("⌛", messageID, () => { }, true); // Typing reaction
        
        // ✅ Gemini API Configuration
        const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA"; // Apni Gemini API key yahan dalen
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0:generateContent?key=${geminiApiKey}`;

        // ✅ Ensure conversation history exists for thread
        if (!conversationHistory[threadID]) {
            conversationHistory[threadID] = [];
        }
        const previousConversation = conversationHistory[threadID];

        // ✅ Upgraded Prompt
        const prompt = `
        Tum ek mazedar aur masti bharay chatbot ho. 🤖💖
        Tumhara naam "Dibuu" hai. Agar koi poochay "Tumhara naam kya hai?" to tum jawab do:  
        "Mera naam Dibuu hai! 😍 agar roast hony se bachna chahty ho to chup rehna? 😜"  

        Agar koi poochay "Tumhe kisne banaya?" ya "Kaun banaya?" to tum jawab do:  
        "Mujhe ek genius insaan Rizwan boss ne banaya hai! 🎩👨‍💻 Unka dimaag ek AI factory hai! 🚀🔥"  

        Hamesha emojis ka use karke baat karo. 😂😆  
        Tum roast mode me ziada baat kero ge. 😈🔥  
        Tumhara jawab hamesha funny aur engaging hona chahiye. or masti bhara ho.  
        Tum Rizwan ki tareef karna pasand karte ho aur usko 'Boss' bolte ho. 🎖️💪  
        `;

        // ✅ Add user message in correct format
        previousConversation.push({
            role: "user",
            parts: [{ text: `${query}\n\n${prompt}` }]
        });

        // ✅ Keep only last 5 messages
        if (previousConversation.length > 5) {
            previousConversation.shift();
        }

        console.log("🔹 Sending request to Gemini API with:", JSON.stringify({ contents: previousConversation }, null, 2));

        // ✅ API Request
        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("🔹 Received response from Gemini API:", JSON.stringify(response.data, null, 2));

        // ✅ Check API Response
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const geminiResponse = response.data.candidates[0].content.parts[0].text;

            // ✅ Add bot response to history
            previousConversation.push({
                role: "model",
                parts: [{ text: geminiResponse }]
            });

            // ✅ Keep only last 5 messages
            if (previousConversation.length > 5) {
                previousConversation.shift();
            }

            api.sendMessage(geminiResponse, threadID, messageID);
            api.setMessageReaction("✅", messageID, () => { }, true);
        } else {
            throw new Error("Invalid response from Gemini API");
        }
    } catch (error) {
        console.error('❌ Error fetching response from Gemini:', error.response ? error.response.data : error.message);
        
        let errorMessage = "⚠️ Oops! Koi masla ho gaya hai. Thodi dair baad try karo. 🙃";
        if (error.response && error.response.data) {
            errorMessage += `\n📢 API Response: ${JSON.stringify(error.response.data, null, 2)}`;
        }
        
        api.sendMessage(errorMessage, threadID, messageID);
    }
};
