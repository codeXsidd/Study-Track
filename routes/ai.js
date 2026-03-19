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

    // Valid model names for the current Gemini API in 2026
    const models = [
        "gemini-3.1-flash",
        "gemini-3.1-pro",
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-2.5-pro"
    ];

    let lastError = null;

    // Try each model using the new syntax
    for (const modelName of models) {
        try {
            console.log(`🤖 AI Attempt: ${modelName} via @google/genai`);
            
            const interaction = await client.interactions.create({
                model: modelName,
                input: `${systemInstruction}\n\nStudent Input: ${prompt}`,
            });

            // Extract text from the new interaction output structure
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

            // Handle invalid API key specifically
            if (err.message.toLowerCase().includes('api key') ||
                err.message.toLowerCase().includes('apikey_invalid') ||
                err.message.toLowerCase().includes('401')) {
                throw new Error("Invalid Gemini API Key. Please verify your credentials.");
            }

            // Continue to next model
            continue;
        }
    }

    // Fallback error if everything failed
    console.error("❌ CRITICAL: ALL AI MODELS FAILED.");
    const finalErrorMessage = lastError ? lastError.message : "Connection failed to all Gemini models.";
    throw new Error(`${finalErrorMessage}. Please check your API key and network connection.`);
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

// 10. AI Task Matchmaker
router.post('/match-task', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const { timeAvailable, energyLevel } = req.body;
        
        if (!timeAvailable || !energyLevel) {
            return res.status(400).json({ message: "Time and energy level are required." });
        }

        const [todos, assignments] = await Promise.all([
            Todo.find({ user: userId, completed: false }),
            Assignment.find({ user: userId, completed: false })
        ]);

        const taskContext = `Pending Todos: ${todos.map(t => t.title).join(', ') || 'None'}\nPending Assignments: ${assignments.map(a => `${a.title} (Due: ${a.deadline.toDateString()})`).join(', ') || 'None'}`;

        const prompt = `I have ${timeAvailable} available and my energy level is ${energyLevel}. 
        Here are my tasks:
        ${taskContext}
        
        Analyze my tasks and recommend EXACTLY ONE best task to do right now. If no tasks exist, suggest a productive micro-habit.
        Return EXACTLY this JSON format: {"recommendedTask": "Task Name", "rationale": "Why I should do it based on time/energy", "type": "todo|assignment|habit"}`;

        try {
            const insight = await callAI(prompt, "You are an expert productivity matchmaker. Only return JSON.");
            res.json(extractJson(insight));
        } catch (e) {
            res.json({
                recommendedTask: "Organize your study space",
                rationale: "Since AI didn't respond, a quick physical reset matches any energy level and takes minimal time.",
                type: "habit"
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 11. AI Mastery Roadmap
router.post('/mastery-roadmap', auth, async (req, res) => {
    try {
        const { topic, timeframe } = req.body;
        
        if (!topic) return res.status(400).json({ message: "Topic is required" });

        const prompt = `Create a learning roadmap to master the topic of "${topic}". The timeframe is ${timeframe || '7 days'}.
        Break it down into progressive milestones.
        Return EXACTLY this JSON format: 
        {
          "topic": "${topic}",
          "milestones": [
            {"day": 1, "title": "...", "description": "...", "timeRecommendation": "1h"}
          ],
          "masteryProject": "A small final project to prove mastery"
        }`;

        try {
            const insight = await callAI(prompt, "You are a curriculum design expert. Only return JSON.");
            res.json(extractJson(insight));
        } catch (e) {
            res.json({
                topic: topic,
                milestones: [
                    { day: 1, title: "Foundations", description: "Understand the core concepts of " + topic, timeRecommendation: "1h" },
                    { day: 2, title: "Deep Dive", description: "Explore advanced principles and use cases", timeRecommendation: "2h" }
                ],
                masteryProject: "Write a 500-word summary explaining it to a beginner."
            });
        }
    } catch (err) {
        res.status(500).json({ message: "AI Error", error: err.message });
    }
});

// 12. Dopamine Vault: Lock and Determine Cost
router.post('/vault/lock', auth, async (req, res) => {
    try {
        const { reward } = req.body;
        if (!reward) return res.status(400).json({ message: "Reward is required" });

        const prompt = `A university student wants to lock away this distraction/reward in a virtual 'Dopamine Vault': "${reward}".
        Determine how many 'Focus Keys' (1 key = 1 completed assignment or 30 mins of deep work) they should have to earn to unlock it.
        Return EXACTLY this JSON format:
        {
            "keysRequired": 3,
            "aiMessage": "A short, gamified message acknowledging the reward and setting the challenge."
        }`;

        try {
            const insight = await callAI(prompt, "You guard the dopamine vault. Be slightly challenging but fair. Return only JSON.");
            const parsed = extractJson(insight);
            // Ensure keys are reasonable
            let keys = parseInt(parsed.keysRequired);
            if (isNaN(keys) || keys < 1) keys = 2;
            if (keys > 10) keys = 10;
            
            res.json({ keysRequired: keys, aiMessage: parsed.aiMessage });
        } catch (e) {
            res.json({ keysRequired: 3, aiMessage: "The Vault is sealed. Prove your focus to unlock your reward." });
        }

    } catch (err) {
        res.status(500).json({ message: "Vault Error", error: err.message });
    }
});

// 13. Dopamine Vault: Override Roast
router.post('/vault/break', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const { reward, keysRemaining } = req.body;
        
        const assignments = await Assignment.find({ user: userId, completed: false }).sort({ deadline: 1 }).limit(3);
        const assignmentContext = assignments.map(a => `${a.title} (due ${a.deadline.toDateString()})`).join(', ');

        const prompt = `A university student is trying to press the "EMERGENCY OVERRIDE" button to break open their Dopamine Vault early to get their reward: "${reward}". 
        They still had ${keysRemaining} Focus Keys left to earn.
        
        Here are their upcoming, pending assignments: ${assignmentContext || 'None immediately due, but there is always studying to do.'}
        
        Generate a brutal, personalized, 2-line "AI Roast" / reality check. Hit them with the academic consequences of yielding to distraction right now. Do not hold back, but keep it PG-13.
        Return EXACTLY this JSON format: {"roast": "the brutally honest reality check"}`;

        try {
            const insight = await callAI(prompt, "You are an intense, highly-demanding academic coach. Do not let them slack off. Return only JSON.");
            res.json(extractJson(insight));
        } catch (e) {
            res.json({ roast: "Are you seriously breaking the vault early? Your assignments aren't going to finish themselves." });
        }

    } catch (err) {
        res.status(500).json({ message: "Vault Error", error: err.message });
    }
});

// 14. Procrastination Simulator (The Butterfly Effect)
router.post('/simulate-procrastination', auth, async (req, res) => {
    try {
        const { taskTitle } = req.body;
        if (!taskTitle) return res.status(400).json({ message: "Task title is required" });

        const prompt = `A university student is considering skipping or procrastinating on this specific task: "${taskTitle}".
        Generate a "Butterfly Effect" narrative showing the cascading negative consequences of skipping this single session.
        Keep it slightly exaggerated and humorous, but genuinely motivating based on the fear of missing out on their potential.
        
        Return EXACTLY this JSON format:
        {
            "oneWeek": "The consequence after 1 week (e.g., failing a quiz, stressing over a deadline).",
            "oneMonth": "The consequence after 1 month (e.g., bombing a midterm, dropping an elective to catch up).",
            "oneYear": "The consequence after 1 year (e.g., losing a dream internship, entirely changing majors)."
        }`;

        try {
            const insight = await callAI(prompt, "You are a dramatic, terrifying narrator showing alternate future timelines to stop procrastination. Return only JSON.");
            res.json(extractJson(insight));
        } catch (e) {
            res.json({ 
                oneWeek: "You fall behind immediately and have to cram all weekend.",
                oneMonth: "Your grade drops severely, causing massive stress.",
                oneYear: "You look back and regret not having the discipline to do this simple task."
            });
        }

    } catch (err) {
        res.status(500).json({ message: "Simulator Error", error: err.message });
    }
});

// 15. AI Mind Sweep (Brain Dump Auto-Organizer)
router.post('/mind-sweep', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Text is required" });

        const prompt = `A user just did a 'brain dump': "${text}".
        Extract actionable items and organize them into three categories: 'todos', 'assignments', and 'notes'.
        - Todos should be short tasks. If it sounds urgent, set 'dayPlan' to true. Priority can be High, Medium, or Low. Format: { title, priority, dayPlan, category } (category can be Study, Personal, etc).
        - Assignments should be major academic tasks. Predict a reasonable deadline if not specified (use YYYY-MM-DD format). Format: { title, description, priority, deadline }.
        - Notes should be for random thoughts, ideas, or links. Format: { title, content, tags: ["BrainDump", "Idea"] }.

        Return EXACTLY this JSON structure, arrays can be empty:
        {
            "todos": [],
            "assignments": [],
            "notes": []
        }`;

        const responseText = await callAI(prompt, "You are an intelligent task extractor and organizer. Respond ONLY with valid JSON.");
        const result = extractJson(responseText);
        
        // ensure default arrays
        res.json({
            todos: result.todos || [],
            assignments: result.assignments || [],
            notes: result.notes || []
        });

    } catch (err) {
        res.status(500).json({ message: "Mind Sweep Error", error: err.message });
    }
});

module.exports = router;
