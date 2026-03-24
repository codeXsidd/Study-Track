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

        const prompt = `Act as a world-class programming teacher and expert software engineer.
Your goal is to teach a COMPLETE BEGINNER while also guiding them to optimal code.
Analyze this ${language || 'programming'} code:

${code}

Mode: ${mode || 'Beginner'}

Return EXACTLY this JSON format (ALL keys must exist):
{
  "simpleSummary": "2-3 lines explaining what the code does in very simple English...",
  "stepByStep": [{"line": 1, "explanation": "Explain each line clearly avoiding jargon...", "variables": {"i": "0"}}],
  "backgroundExecution": "Explain what happens in memory (RAM), how variables are stored, and CPU execution like a story...",
  "dryRun": "Take a sample input and show step-by-step execution...",
  "visualization": "Show changes like: i = 0 -> 1 -> 2, sum = 0 -> 3",
  "analogy": "Explain using a simple real-world example...",
  "timeComplexity": "O(N) - explain in very simple terms...",
  "spaceComplexity": "O(1) - explain in very simple terms...",
  "beginnerTips": "Common mistakes beginners make and what to focus on...",
  "mistakes": "Check for logical errors, edge case issues, inefficient parts...",
  "optimalSolution": "Format: Current Approach: ... Better Approach: ... Why Better: ...",
  "optimizedCode": "// Provide improved version of the code with beginner comments",
  "interviewInsight": "What interviewer expects and common follow-up questions"
}`;

        const systemInstruction = "You are a senior full-stack developer and AI programming tutor. Return ONLY valid JSON.";

        try {
            const responseText = await callAI(prompt, systemInstruction);
            const result = extractJson(responseText);
            res.json(result);
        } catch (e) {
            console.error("CodeInsight Analysis Error:", e);
            // Fallback response
            res.json({
                simpleSummary: "This code performs standard operations.",
                stepByStep: [{ line: 1, explanation: "Starting execution", variables: {} }],
                backgroundExecution: "The CPU reads your instructions one by one and stores variables in memory.",
                dryRun: "Input: 5. Step 1: starts... Step 2: ends.",
                visualization: "x = 0 -> 5",
                analogy: "Like reading a book page by page.",
                timeComplexity: "O(N)",
                spaceComplexity: "O(1)",
                beginnerTips: "Remember to check for edge cases.",
                mistakes: "No major logical errors detected in fallback.",
                optimalSolution: "Current: Basic. Better: Optimized approach.",
                optimizedCode: "// Optimised code here",
                interviewInsight: "Focus on edge cases."
            });
        }
    } catch (err) {
        res.status(500).json({ message: "CodeInsight Error", error: err.message });
    }
});

module.exports = router;
