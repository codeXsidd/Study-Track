const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const getClient = (key) => {
    try {
        if (!key) return null;
        return new GoogleGenAI({ apiKey: key });
    } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err.message);
        return null;
    }
};

const callAI = async (prompt, systemInstruction = "You are a helpful AI study assistant.") => {
    let key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY_MISSING");

    key = key.trim().replace(/^["']|["']$/g, '');
    const client = getClient(key);
    if (!client) throw new Error("AI_CLIENT_INITIALIZATION_FAILED");

    const models = [
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-3.1-flash",
        "gemini-3.1-pro",
        "gemini-2.5-pro",
        "gemini-2.0-flash-lite"
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 CodeInsight AI Attempt: ${modelName}`);
            const response = await client.models.generateContent({
                model: modelName,
                contents: `${systemInstruction}\n\nUser Request: ${prompt}`,
            });

            if (response && response.text) {
                console.log(`✅ CodeInsight AI Success: ${modelName}`);
                return response.text.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message);
            if (err.message.toLowerCase().includes('api key') ||
                err.message.toLowerCase().includes('apikey_invalid') ||
                err.message.toLowerCase().includes('401')) {
                throw new Error("Invalid Gemini API Key.");
            }
            continue;
        }
    }

    console.error("❌ CRITICAL: ALL CodeInsight AI MODELS FAILED.");
    const finalErrorMessage = lastError ? lastError.message : "Connection failed to all Gemini models.";
    throw new Error(finalErrorMessage);
};

const extractJson = (text) => {
    try {
        return JSON.parse(text.trim());
    } catch (e) {
        try {
            const firstBrace = text.search(/\{|\[/);
            const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
            if (firstBrace !== -1 && lastBrace !== -1) {
                const cleaned = text.substring(firstBrace, lastBrace + 1);
                return JSON.parse(cleaned);
            }
        } catch (inner) {
            console.error("Failed to extract JSON from text:", text);
        }
        throw new Error("JSON_PARSE_FAILED");
    }
};

router.post('/analyze', auth, async (req, res) => {
    try {
        const { code, language, mode } = req.body;
        if (!code) return res.status(400).json({ message: "Code is required" });

        const prompt = `Act as a world-class programming teacher and expert software engineer. Your goal is to teach a COMPLETE BEGINNER while also guiding them to write efficient, optimal code.
Analyze this ${language || 'programming'} code:

${code}

Mode: ${mode || 'Beginner'}

Return EXACTLY this JSON format and nothing else:
{
  "simpleSummary": "Explain what the code does in 2-3 lines using very simple English.",
  "stepByStep": "Explain each line of code clearly. What keywords mean, why they are used. Formatted as markdown.",
  "background": "Explain what happens in the background. What happens in memory (RAM), how variables are stored, how the CPU executes this. Like a story.",
  "executionSteps": [
    { "line": 1, "explanation": "Detailed explanation of this specific execution step.", "variables": {"i": "0"} }
  ],
  "visualization": "Text simulation of variable changes (e.g., i = 0 -> 1 -> 2)",
  "analogy": "Explain using a simple real-world example.",
  "timeComplexity": "Explain time complexity in simple terms. Avoid heavy math.",
  "spaceComplexity": "Explain space complexity in simple terms.",
  "beginnerTips": "Common mistakes beginners make and what to focus on.",
  "mistakes": "Identify logical errors, edge cases, or inefficient parts in the original code.",
  "betterApproach": "Suggest a more efficient or cleaner approach and explain why.",
  "optimizedCode": "Provide the completely improved version of the code with beginner comments.",
  "interviewInsight": "What an interviewer expects from this problem and follow-up questions."
}`;

        const systemInstruction = "You are a senior full-stack developer and world-class AI programming tutor. Always return valid structured JSON without markdown code blocks surrounding the JSON.";

        try {
            const responseText = await callAI(prompt, systemInstruction);
            const result = extractJson(responseText);
            res.json(result);
        } catch (e) {
            console.error("CodeInsight Analysis Error:", e);
            res.json({
                simpleSummary: "This code performs standard operations.",
                stepByStep: "- Line 1 starts the process...",
                background: "The RAM allocates space for your variables...",
                executionSteps: [{ line: 1, explanation: "Starting execution", variables: {} }],
                visualization: "Variables initialize...",
                analogy: "Like reading a book page by page.",
                timeComplexity: "O(N) - Linear time.",
                spaceComplexity: "O(1) - Constant space.",
                beginnerTips: "Always remember to name variables clearly.",
                mistakes: "No major logical errors detected in fallback mode.",
                betterApproach: "Use built-in functions where applicable.",
                optimizedCode: "// Optimizations will appear here in normal operation",
                interviewInsight: "Focus on explaining your thought process out loud."
            });
        }
    } catch (err) {
        res.status(500).json({ message: "CodeInsight Error", error: err.message });
    }
});

module.exports = router;
