const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');
const Assignment = require('../models/Assignment');
const Note = require('../models/Note');
const { GoogleGenAI } = require('@google/genai');

// Initialize the new Google GenAI Client
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

    // Cleaning API Key
    key = key.trim().replace(/^["']|["']$/g, '');

    const client = getClient(key);
    if (!client) throw new Error("AI_CLIENT_INITIALIZATION_FAILED");

    // Standardized models for the new Interactions API
    const models = [
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 AI Attempt: ${modelName} via Interactions API`);

            const interaction = await client.interactions.create({
                model: modelName,
                input: `${systemInstruction}\n\nStudent Input: ${prompt}`,
            });

            // Using the specific output path provided in the user's sample
            if (interaction && interaction.outputs && interaction.outputs.length > 0) {
                const responseText = interaction.outputs[interaction.outputs.length - 1].text;
                if (responseText) {
                    console.log(`✅ AI Success: ${modelName}`);
                    return responseText.trim();
                }
            }
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message);

            if (err.message.toLowerCase().includes('api key') ||
                err.message.toLowerCase().includes('401')) {
                throw new Error("Invalid Gemini API Key. Please verify your credentials.");
            }
            continue;
        }
    }

    throw new Error(lastError ? lastError.message : "Failed to connect to Gemini models.");
};

// Helper to extract JSON from AI response safely
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

        const prompt = `Break down the following student goal into 3-5 highly actionable, small subtasks:\n\nGoal: "${taskTitle}"\n\nReturn EXACTLY this JSON array format:\n[{"title":"Phase 1", "duration":"30m"}, {"title":"...", "duration":"..."}]`;

        try {
            const responseText = await callAI(prompt);
            const subtasks = extractJson(responseText);
            res.json(subtasks);
        } catch (e) {
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
            const responseText = await callAI(prompt, "You are a professional instructor. Extract key concepts.");
            const cards = extractJson(responseText);
            res.json(cards);
        } catch (e) {
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
            const responseText = await callAI(prompt, "You are a concise, highly knowledgeable, friendly tutor helping a university student. Keep answers under 3 short paragraphs. Use analogies.");
            res.json({ reply: responseText.trim() });
        } catch (e) {
            if (e.message === 'API_KEY_MISSING') {
                res.json({ reply: "I'm currently in **Demonstration Mode**. Please configure the `GEMINI_API_KEY` to enable my full intelligence." });
            } else {
                res.json({ reply: "I'm experiencing a brief connection issue. Try asking me again in a few seconds." });
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
            res.json({ summary: "• Core themes extracted from the material.\n• Key technical concepts summarized.\n• Actionable takeaways provided." });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 5. Timetable Optimization
router.post('/optimize', auth, async (req, res) => {
    try {
        const { timetable, focus } = req.body;
        const prompt = `Optimize this student timetable for ${focus || 'overall productivity'}. 
        Timetable Data: ${JSON.stringify(timetable)}
        Return EXACTLY this JSON format: {"suggestions": ["suggestion 1", "suggestion 2"], "score": 85}`;

        try {
            const responseText = await callAI(prompt, "Study efficiency expert. Return raw JSON.");
            res.json(extractJson(responseText));
        } catch (e) {
            res.json({
                suggestions: [
                    "Prioritize harder subjects during your peak energy hours.",
                    "Ensure adequate breaks between intense study sessions.",
                    "Your current schedule represents a solid balance."
                ],
                score: 75
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 6. GPA Predictor
router.post('/gpa-strategy', auth, async (req, res) => {
    try {
        const { currentCgpa, targetCgpa, remainingSems } = req.body;
        const prompt = `Current CGPA: ${currentCgpa}. Target: ${targetCgpa}. Remaining semesters: ${remainingSems}. 
        Calculate required SGPA. Return EXACTLY a JSON: {"requiredSgpa": "9.2", "advice": "...", "difficulty": "Hard"}`;

        try {
            const responseText = await callAI(prompt, "Academic advisor. Return only raw JSON.");
            res.json(extractJson(responseText));
        } catch (e) {
            const diff = (targetCgpa * 8) - (currentCgpa * (8 - remainingSems));
            const reqSgpa = Math.min(10, Math.max(0, diff / remainingSems)).toFixed(2);
            res.json({
                requiredSgpa: reqSgpa,
                advice: `To hit ${targetCgpa}, you'll need approximately ${reqSgpa} SGPA. Focus on high-credit subjects.`,
                difficulty: reqSgpa > 9 ? "Hard" : reqSgpa > 8 ? "Moderate" : "Easy"
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 7. Student Metrics
router.get('/metrics', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [todos, assignments] = await Promise.all([
            Todo.find({ user: userId }),
            Assignment.find({ user: userId, completed: false })
        ]);

        const completedToday = todos.filter(t => t.completed && t.completedAt >= startOfDay).length;
        const pendingToday = todos.filter(t => !t.completed && t.dayPlan).length;
        const totalPending = todos.filter(t => !t.completed).length + assignments.length;

        let distraction = completedToday >= 2 ? "Low" : pendingToday > 4 ? "High" : "Moderate";
        let load = totalPending > 10 ? "High" : totalPending > 5 ? "Heavy" : "Balanced";
        let flowPotential = (80 + (completedToday * 2) - pendingToday).toString() + "%";

        res.json({ distraction, load, flow: flowPotential });
    } catch (err) {
        res.status(500).json({ message: "AI Metrics Error", error: err.message });
    }
});

// 8. Daily Briefing
router.get('/briefing', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const [todos, assignments, notes] = await Promise.all([
            Todo.find({ user: userId, completed: false, dayPlan: true }),
            Assignment.find({ user: userId, completed: false }).sort({ deadline: 1 }).limit(3),
            Note.find({ user: userId }).sort({ updatedAt: -1 }).limit(2)
        ]);

        const todoContext = todos.map(t => t.title).join(', ');
        const assignmentContext = assignments.map(a => `${a.title} (due ${a.deadline.toDateString()})`).join(', ');
        const noteContext = notes.map(n => n.content.substring(0, 50)).join('; ');

        const prompt = `Generate a concise 80-word briefing for a student. 
        Focus: ${todoContext || 'Clear'}
        Assignments: ${assignmentContext || 'None'}
        Notes: ${noteContext || 'None'}
        Format: Greeting, priority highlight, and one motivational tip.`;

        try {
            const summary = await callAI(prompt, "High-performance study coach.");
            res.json({ briefing: summary });
        } catch (e) {
            res.json({ briefing: "Focus on your upcoming assignments and stay consistent with your habit tracker today!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Briefing error", error: err.message });
    }
});

// 9. Deep Work Insights
router.get('/insights', auth, async (req, res) => {
    try {
        const prompt = "Generate one unique, 2-sentence deep work tip for a university student.";
        try {
            const insight = await callAI(prompt, "Performance coach.");
            res.json({ insight });
        } catch (e) {
            res.json({ insight: "Eliminate digital distractions for 90 minutes to achieve peak cognitive flow." });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 10. AI Mastery Roadmap Generator
router.post('/roadmap', auth, async (req, res) => {
    try {
        const { topic, level } = req.body;
        if (!topic) return res.status(400).json({ message: "Topic required" });

        const prompt = `Create a high-intensity, 7-day mastery roadmap for the student to learn: "${topic}".
        Target level: ${level || 'Beginner to Intermediate'}.
        For each day, provide a 'focus' and a 'challenge'.
        Return EXACTLY this JSON format:
        {
            "topic": "${topic}",
            "overview": "A brief overview...",
            "roadmap": [
                {"day": 1, "focus": "...", "challenge": "..."},
                ...
            ]
        }`;

        try {
            const responseText = await callAI(prompt, "Expert educational consultant. Return raw JSON.");
            res.json(extractJson(responseText));
        } catch (e) {
            // Fallback
            res.json({
                topic,
                overview: "Your roadmap to mastering " + topic,
                roadmap: Array.from({ length: 7 }, (_, i) => ({
                    day: i + 1,
                    focus: `Core concept ${i + 1} of ${topic}`,
                    challenge: `Practical exercise for ${topic} phase ${i + 1}`
                }))
            });
        }
    } catch (err) {
        res.status(500).json({ message: "Roadmap Error", error: err.message });
    }
});

module.exports = router;
