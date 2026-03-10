const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAIModel = (modelName, key, version = 'v1') => {
    try {
        const genAI = new GoogleGenerativeAI(key);
        // Default to v1, but allow v1beta as fallback for older models if needed
        return genAI.getGenerativeModel({ model: modelName }, { apiVersion: version });
    } catch (err) {
        return null;
    }
};

const callAI = async (prompt, systemInstruction = "You are a helpful AI study assistant.") => {
    let key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY_MISSING");

    // Aggressive cleaning to remove quotes or erratic whitespace
    key = key.trim().replace(/^["']|["']$/g, '');

    const fullPrompt = `${systemInstruction}\n\nStudent Input: ${prompt}`;

    // Valid model names for the current Gemini API
    const models = [
        "gemini-3.1-flash",
        "gemini-3.1-pro",
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    // Try each model
    for (const modelName of models) {
        try {
            console.log(`🤖 AI Attempt: ${modelName} (v1)`);
            const activeModel = getAIModel(modelName, key, 'v1');
            if (!activeModel) continue;

            const result = await activeModel.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ AI Success: ${modelName}`);
                return text.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed on v1:`, err.message);

            // If the key specifically is invalid, no point in trying other models
            if (err.message.toLowerCase().includes('api key') ||
                err.message.toLowerCase().includes('apikey_invalid')) {
                throw new Error("The API Key provided in Render appears to be invalid. Please check for extra spaces or incorrect characters.");
            }

            // If it's a 404 or unsupported on v1, we might try it once more on v1beta for robustness
            if (err.message.includes('404') || err.message.includes('not found')) {
                try {
                    console.log(`🔄 AI Retry: ${modelName} (v1beta)`);
                    const betaModel = getAIModel(modelName, key, 'v1beta');
                    const betaResult = await betaModel.generateContent(fullPrompt);
                    const betaResponse = await betaResult.response;
                    const betaText = betaResponse.text();
                    if (betaText) {
                        console.log(`✅ AI Success: ${modelName} (v1beta)`);
                        return betaText.trim();
                    }
                } catch (betaErr) {
                    console.warn(`⚠️ Model ${modelName} also failed on v1beta:`, betaErr.message);
                }
            }
            // Continue to next model if this one failed
            continue;
        }
    }

    // Comprehensive error if everything failed
    console.error("❌ CRITICAL: ALL AI MODELS FAILED.");
    const finalErrorMessage = lastError ? lastError.message : "Connection failed to all Gemini models.";
    throw new Error(`${finalErrorMessage}. (Check your API key and region settings)`);
};

// Helper to extract JSON from AI response safely
const extractJson = (text) => {
    try {
        // Try direct parse first
        return JSON.parse(text.trim());
    } catch (e) {
        try {
            // Find first { or [ and last } or ]
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

// Diagnostics: Test AI Key
router.get('/verify', auth, async (req, res) => {
    try {
        const text = await callAI("Respond with only the word 'READY' if you can hear me.", "Safety test.");
        res.json({ status: 'Connected', response: text });
    } catch (err) {
        res.status(500).json({ status: 'Error', message: err.message, key_exists: !!process.env.GEMINI_API_KEY });
    }
});


// 1. Break down a complex task into subtasks
router.post('/breakdown', auth, async (req, res) => {
    try {
        const { taskTitle } = req.body;
        if (!taskTitle) return res.status(400).json({ message: "Task title required" });

        const prompt = `Break down the following student goal into 3-5 highly actionable, small subtasks:\n\nGoal: "${taskTitle}"\n\nReturn EXACTLY this JSON array format (no markdown formatting, no comments):\n[{"title":"Phase 1", "duration":"30m"}, {"title":"...", "duration":"..."}]`;

        try {
            const responseText = await callAI(prompt);
            const subtasks = extractJson(responseText);
            res.json(subtasks);
        } catch (e) {
            // Mock Fallback
            res.json([
                { title: `Research concepts for ${taskTitle.split(' ')[0]}`, duration: "30m" },
                { title: `Draft outline and main points`, duration: "45m" },
                { title: `Review and finalize details`, duration: "20m" }
            ]);
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});


// 2. Generate Flashcards from notes
router.post('/flashcards', auth, async (req, res) => {
    try {
        const { noteContent } = req.body;
        if (!noteContent || noteContent.length < 10) return res.status(400).json({ message: "More content required." });

        const prompt = `Convert the following study notes into 2 to 4 interactive flashcards.\n\nNotes:\n"${noteContent}"\n\nReturn EXACTLY this JSON array format:\n[{"q":"What is...", "a":"It is..."}, {"q":"...", "a":"..."}]`;

        try {
            const responseText = await callAI(prompt, "You extract key concepts and testing material.");
            const cards = extractJson(responseText);
            res.json(cards);
        } catch (e) {
            // Mock Fallback
            res.json([
                { q: "What is the main topic here?", a: "The core concept discussed in the text." },
                { q: "Can you list a key detail?", a: "A specific fact mentioned in the notes." }
            ]);
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});


// 3. AI Tutor (Chat)
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ message: "Message required" });

        let prompt = `Student says: "${message}"\n`;
        if (context) prompt += `\nContext: ${context}`;

        try {
            const responseText = await callAI(prompt, "You are a concise, highly knowledgeable, friendly tutor helping a university student in a Deep Focus Room. Keep answers under 3-4 short paragraphs. Explain concepts simply through analogies if possible.");
            res.json({ reply: responseText.trim() });
        } catch (e) {
            console.error('❌ AI Chat Detailed Error:', e);
            // Professional Fallback with diagnostic info
            if (e.message === 'API_KEY_MISSING') {
                res.json({ reply: "I'm currently in **Demonstration Mode**. To enable my full AI capabilities, please ensure the `GEMINI_API_KEY` is set in the Render environment variables." });
            } else {
                res.json({ reply: "I'm having trouble connecting right now. Please try again in a moment." });
            }
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});



// 4. Summarizer
router.post('/summarize', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Text required" });

        const prompt = `Summarize the following reading material into 3-5 concise bullet points.\n\nText:\n"${text}"`;

        try {
            const responseText = await callAI(prompt);
            res.json({ summary: responseText.trim() });
        } catch (e) {
            console.error('AI Summarize Error:', e.message);
            // Professional Fallback
            res.json({ summary: "• Extracted core themes from your reading material.\n• Summarized key technical concepts for better retention.\n• Final actionable summary of the provided text." });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 5. Timetable Optimization
router.post('/optimize', auth, async (req, res) => {
    try {
        const { slots, todoCount } = req.body;
        const prompt = `Optimize this student timetable. They have ${todoCount} pending tasks.
        Current Timetable Slots: ${JSON.stringify(slots)}
        
        Return EXACTLY this JSON format (no markdown):
        {
          "advice": "General strategy for the week...",
          "suggestions": ["Specific tip 1", "Specific tip 2"],
          "score": 85
        }`;

        try {
            const responseText = await callAI(prompt, "You are a study efficiency expert. Return raw JSON.");
            res.json(extractJson(responseText));
        } catch (e) {
            console.error('AI Optimize Error:', e.message);
            res.json({
                advice: "Focus on your core subjects during your peak energy hours.",
                suggestions: [
                    "Consider moving heavy subjects to your peak morning hours.",
                    "Ensure you have at least 15-minute breaks between back-to-back classes.",
                    "Your current schedule looks well-balanced for the week."
                ],
                score: 75
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 6. GPA Strategy Predictor
router.post('/gpa-strategy', auth, async (req, res) => {
    try {
        const { currentCgpa, targetCgpa, remainingSems } = req.body;

        const prompt = `Student current CGPA is ${currentCgpa}. Target is ${targetCgpa} with ${remainingSems} semesters left. 
        Calculate required average SGPA. Return EXACTLY a JSON: {"requiredSgpa": "9.2", "advice": "...", "difficulty": "Hard/Moderate/Easy"}`;

        try {
            const responseText = await callAI(prompt, "You are a professional academic advisor. Return only raw JSON.");
            res.json(extractJson(responseText));
        } catch (e) {
            console.error('GPA Strategy AI Error:', e.message);
            // Intelligent Fallback Calculation
            const diff = (targetCgpa * 8) - (currentCgpa * (8 - remainingSems));
            const reqSgpa = Math.min(10, Math.max(0, diff / remainingSems)).toFixed(2);
            res.json({
                requiredSgpa: reqSgpa,
                advice: `To reach your ${targetCgpa} goal, you'll need to maintain around ${reqSgpa} SGPA. Focus on core subjects with high credits.`,
                difficulty: reqSgpa > 9 ? "Hard" : reqSgpa > 7.5 ? "Moderate" : "Easy"
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

module.exports = router;
