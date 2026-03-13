const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testStable() {
    console.log("\n--- Testing @google/generative-ai (STABLE) ---");
    let key = process.env.GEMINI_API_KEY;
    if (!key) return;
    key = key.trim().replace(/^["']|["']$/g, '');

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("SUCCESS with Stable SDK!");
        console.log("Text:", response.text());
        return true;
    } catch (e) {
        console.log("Stable FAILED:", e.message);
        return false;
    }
}

testStable();
