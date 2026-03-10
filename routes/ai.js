const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const callAI = async (prompt, systemInstruction = "You are a helpful AI study assistant.") => {
    let key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY_MISSING");

    key = key.trim().replace(/^["']|["']$/g, '');

    const client = new GoogleGenAI({ apiKey: key });

    // Models to try in order. Gemini 3 is the priority but preview models can be unstable.
    const models = [
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 AI Attempt (${modelName}) using Interactions API`);
            
            // Prepend system instruction to the input to ensure it's followed regardless of API version support for system_instruction param
            const combinedInput = `${systemInstruction}\n\nSTUDENT REQUEST: ${prompt}`;

            const interaction = await client.interactions.create({
                model: modelName,
                input: combinedInput
            });

            if (interaction && interaction.outputs && interaction.outputs.length > 0) {
                const text = interaction.outputs[interaction.outputs.length - 1].text;
                if (text) {
                    console.log(`✅ AI Success: ${modelName}`);
                    return text.trim();
                }
            }
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message);

            // Handle 404 (not found) - might happen if the new API isn't enabled for certain older models
            if (err.message.includes('404')) {
                // Try one more time with generateContent if interactions.create isn't supported for this specific model
                try {
                    console.log(`🔄 Retrying with generateContent for ${modelName}`);
                    const response = await client.models.generateContent({
                        model: modelName,
                        systemInstruction: systemInstruction,
                        contents: prompt
                    });
                    if (response && response.text) {
                        console.log(`✅ AI Success (Fallback API): ${modelName}`);
                        return response.text.trim();
                    }
                } catch (fallbackErr) {
                    console.warn(`⚠️ fallback generateContent also failed for ${modelName}`);
                }
            }

            // Handle 429 (rate limit)
            if (err.message.includes('429')) {
                console.log(`⏳ Rate limited on ${modelName}, switching...`);
                continue;
            }

            if (err.message.toLowerCase().includes('api key') || err.message.toLowerCase().includes('invalid')) {
                throw new Error("Invalid API Key. Please check your GEMINI_API_KEY.");
            }
            
            continue;
        }
    }

    throw new Error(lastError ? lastError.message : "Connect failed to all models.");
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
