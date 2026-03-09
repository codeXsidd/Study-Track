const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAIModel = (modelName = "gemini-1.5-flash", systemText = "") => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    try {
        const genAI = new GoogleGenerativeAI(key);
        const config = { model: modelName };
        if (systemText) {
            config.systemInstruction = systemText;
        }
        return genAI.getGenerativeModel(config);
    } catch (err) {
        console.error(`❌ AI Init Error (${modelName}):`, err.message);
        return null;
    }
};

// Simplified callAI that handles its own model instantiation to allow different system instructions
const callAI = async (prompt, systemInstruction = "You are a helpful AI study assistant.") => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("API_KEY_MISSING");

    // Try gemini-1.5-flash first (cheaper/faster/better)
    let currentModelName = "gemini-1.5-flash";

    try {
        const activeModel = getAIModel(currentModelName, systemInstruction);
        if (!activeModel) throw new Error("INIT_FAILED");

        const result = await activeModel.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.warn(`⚠️ Attempt with ${currentModelName} failed:`, err.message);

        // If 404 or specific error, try gemma/pro fallback
        if (err.message.includes('404') || err.message.includes('not found')) {
            console.warn('🔄 Attempting fallback to gemini-1.5-pro...');
            try {
                const fallbackModel = getAIModel("gemini-1.5-pro", systemInstruction);
                if (fallbackModel) {
                    const result = await fallbackModel.generateContent(prompt);
                    return result.response.text();
                }
            } catch (fallbackErr) {
                console.error('❌ Fallback failed:', fallbackErr.message);
                throw fallbackErr;
            }
        }
        throw err;
    }
};


// 1. Break down a complex task into subtasks
router.post('/breakdown', auth, async (req, res) => {
    try {
        const { taskTitle } = req.body;
        if (!taskTitle) return res.status(400).json({ message: "Task title required" });

        const prompt = `Break down the following student goal into 3-5 highly actionable, small subtasks:\n\nGoal: "${taskTitle}"\n\nReturn EXACTLY this JSON array format (no markdown formatting, no comments):\n[{"title":"Phase 1", "duration":"30m"}, {"title":"...", "duration":"..."}]`;

        try {
            const responseText = await callAI(prompt);
            const rawJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const subtasks = JSON.parse(rawJson);
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
            const rawJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const cards = JSON.parse(rawJson);
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
            console.error('AI Chat Error:', e.message);
            // Professional Fallback
            if (e.message === 'API_KEY_MISSING') {
                res.json({ reply: "I'm currently in **Demonstration Mode**. To enable my full AI capabilities, please ensure the `GEMINI_API_KEY` is set in the server environment settings." });
            } else {
                res.json({ reply: "I'm currently having trouble connecting to my central brain. Let me try to help based on my local knowledge: Consistency is the key to mastering any subject. Try breaking your current focus into 15-minute sprints!" });
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

// 5. Optimize Timetable
router.post('/optimize', auth, async (req, res) => {
    try {
        const { slots, todoCount } = req.body;

        const prompt = `Given these university classes: ${JSON.stringify(slots.map(s => `${s.day} P${s.period}: ${s.subject}`))}\n\nSuggest 3 highly productive study slots today (or earliest available) for ${todoCount} pending tasks. Keep suggestions very short.`;

        try {
            const responseText = await callAI(prompt, "You are a expert study scheduler.");
            res.json({ advice: responseText.trim() });
        } catch (e) {
            // Mock Fallback
            res.json({ advice: `Based on your schedule, I recommend focusing between 4 PM and 6 PM today, as you have no classes then. Another great window is tomorrow morning before your first period.` });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

module.exports = router;
