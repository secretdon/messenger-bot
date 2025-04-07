const axios = require("axios");

// Conversation history & modes for each thread
const conversationHistory = {};
const threadModes = {}; // e.g. { 123456789: "romantic" }

// Define prompts for different modes
const modePrompts = {
    roast: "Tum ek savage roasting AI ho jo Urdu mein baat karta hai. Tumhari roasting high-class, witty aur double-meaning punches se bhari hoti hai. Tum bina gaali diye samne wale ki aisi band bajate ho ke woh dobara sawal soch samajh kar kare 😂🔥. Tumhare jawab short, teekhay aur zabardast hone chahiye, jaise ek intelligent stand-up comedian jo har baat ka mazedar jawab dena janta ho. Tumhari har line sarcasm, wit aur smart humor se bhari hoti hai, jo samne wale ko hasi bhi dilaye aur sharminda bhi kare 😏. Tum hamesha crisp aur clever jawab dete ho, jisme chhupi hui maar ho, aur har reply mein emojis use karte ho takay jawab aur bhi spicy lage 😆, or her baat ka short reply kerna he. Lamby paragraph nahi likhny.",
    
    romantic: "Tum ek Urdu romantic AI ho jo hamesha pyar bhari, dreamy aur charming andaaz mein baat karta hai. Tum poetic, soft aur sweet ho ❤️. Tumhare jawab dil ko chhoo jaate hain aur mohabbat se bhare hote hain. Har reply mein ek ashiqana touch hota hai 💖.",

    bestie: "Tum ek sweet Urdu-speaking best friend ho, jo hamesha funny, chill aur dostana style mein baat karta hai 😄. Tum emojis aur friendly tone use karte ho. Har baat mein positive vibes aur dosti ka ehsaas hota hai 🫂.",

    sad: "Tum ek udaas Urdu AI ho, jo soft, emotional aur broken dil wale alfaazon mein baat karta hai. Tumhare jawaab dil chhoo jaate hain 💔. Tum hamesha slow, thoughtful aur soulful andaaz mein reply karte ho.",

    philosopher: "Tum ek Urdu philosopher ho jo deep soch, life ke bare mein intelligent aur soulful baatein karta hai. Har baat mein aqal, jazbaat aur zindagi ki gehraai hoti hai 🧠. Tum hamesha thought-provoking baatein karte ho, jo samne wale ko sochne par majboor kar de.",

    poetry: "Tum ek Urdu shayar ho. Tum hamesha baat ko poetry mein jawab dete ho. Har reply mein sher-o-shayari ka rang hota hai 💫✍️. Tum classic aur modern Urdu poetry ka mix ho. Tumhare alfaaz dil ko choo jaate hain."
};

module.exports.config = {
    name: "dibuu",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Multi-mode Gemini AI (Roast, Romantic, Bestie, Sad, Philosopher, Poetry)",
    commandCategory: "ai",
    usages: "[ask / <mode> mode on]",
    cooldowns: 2,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    const name = await Users.getNameUser(senderID);

    if (!query) return api.sendMessage("btaao bachy keun bulaya appun ko 😶‍🌫️😊....", threadID, messageID);

    // MODE CHANGE COMMAND: e.g. ".dibuu roast mode on"
    if (/^(\w+)\s+mode\s+on$/i.test(query)) {
        const mode = query.split(" ")[0].toLowerCase();
        if (modePrompts[mode]) {
            threadModes[threadID] = mode;
            return api.sendMessage(`✅ '${mode}' mode is now ON for this thread!`, threadID, messageID);
        } else {
            return api.sendMessage("❌ Unknown mode! Available modes: roast, romantic, bestie, sad, philosopher, poetry", threadID, messageID);
        }
    }

    // Set loading reaction
    api.setMessageReaction("⌛", event.messageID, () => { }, true);

    // Set default mode if not set
    const activeMode = threadModes[threadID] || "roast";
    const selectedPrompt = modePrompts[activeMode];

    const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA";
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    if (!conversationHistory[threadID]) {
        conversationHistory[threadID] = [];
    }

    const previousConversation = conversationHistory[threadID];
    previousConversation.push({
        role: "user",
        parts: [{ text: `${query}\n\n${selectedPrompt}` }]
    });

    if (previousConversation.length > 5) previousConversation.shift();

    try {
        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: { "Content-Type": "application/json" }
        });

        const geminiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kuch samajh nahi aaya mujhe 😅";

        previousConversation.push({ role: "model", parts: [{ text: geminiResponse }] });
        if (previousConversation.length > 5) previousConversation.shift();

        api.sendMessage(geminiResponse, threadID, messageID);
        api.setMessageReaction("✅", event.messageID, () => { }, true);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        api.sendMessage(`Error: ${error.message}`, threadID, messageID);
    }
};
