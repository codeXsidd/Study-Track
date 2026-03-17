# StudyTrack - Premium AI-Powered Student Productivity Workspace 🚀

StudyTrack is an all-in-one, ultra-premium personal student workspace designed to transform academic chaos into peak productivity. Powered by **Google Gemini AI**, it goes beyond simple tracking—it acts as your personal tutor, scheduler, and motivator.

## 🌟 The Vision & Idea
The core idea behind **StudyTrack** is to create a holistic, intelligent ecosystem that actively helps students beat procrastination, build positive study habits, and understand their learning at a deeper level. Traditional apps just give you a checklist. StudyTrack gives you an AI agent that monitors your success, rewards you for consistency, and intervenes when you fall behind.

## 💎 Premium Experience
- **Ultra-Modern UI:** Sleek glassmorphism, fluid animations (Slide-Scale & Fade-Up), and a mobile-first side-swiping UX.
- **Deep Focus Room:** A dedicated distraction-free zone with an integrated **AI Tutor** and background ambience.
- **Gamified Progress System:** Earn XP, level up, and maintain streaks with the Activity Heatmap and Habit Tracker. Turn studying into an RPG where *you* are the main character.

---

## ✨ Key Features & Capabilities

### 🧠 Google Gemini AI Intelligence
- **AI Task Breakdown:** Instantly convert large, overwhelming study goals into small, actionable 15-30 minute subtasks.
- **AI Daily Briefing & Quick Actions:** Start your day with a customized breakdown of your priorities and one-click actions to jump straight into work.
- **AI Procrastination Simulator:** A unique feature that uses AI-generated narratives to visualize the negative consequences of putting off your work, motivating you to start *now*.
- **AI Flashcards & Quizzes:** Generate interactive testing material directly from your study notes.
- **AI Tutor Chat:** Get instant explanations, code debugging, and analogies for complex concepts while you're in the Focus Room.
- **AI GPA Predictor:** Predictive analysis of required SGPA to hit your target CGPA, including difficulty level and strategy advice.

### 📅 Core Study & Organization Suite
- **Dashboard Planner Widget:** A central command center for today's planned tasks, priorities, and backlog.
- **Dynamic Habit Builder:** A 7-day progress tracker and monthly visual calendar to build and maintain powerful routines.
- **Mastery Roadmap:** Visualize your long-term learning journey and track your progression in specific skills or subjects.
- **Productivity Score Graph:** A multi-dimensional chart that tracks your "Productivity Score" (weighted Study Hours + Tasks) to visualize your true academic output.
- **GPA/CGPA Analytics:** Multi-semester performance tracking with live progression charts.
- **Study Journal & Notes:** Rich text note-taking, markdown support, and study hour tracking.
- **Pomodoro Timer:** Focused work cycles with automated rest intervals and XP rewards upon completion.
- **Portfolio & Certificates:** A central hub to host, manage, and showcase your academic achievements and projects.

---

## 🛠️ Tech Stack & Architecture

**Frontend:**
- **React (Vite):** Core framework for speed, modularity, and lightning-fast HMR.
- **Tailwind CSS:** Professional utility-first styling for a completely responsive design.
- **React Router V6:** Smooth client-side routing.
- **Lucide Icons & Chart.js:** Clean typography, iconography, and dynamic data visualization.

**Backend & Integration:**
- **Node.js & Express:** Scalable API architecture handling complex business logic.
- **MongoDB (Atlas):** Secure cloud database storing tasks, grades, habits, and encrypted user data.
- **Google Generative AI SDK (@google/genai):** Powers the Gemini 1.5-Flash intelligence orchestrating the AI features.
- **JWT Authentication:** Secure user sessions and state persistence.
- **Deployment:** Frontend hosted seamlessly on **Vercel**, with the backend API powered by **Render**.

---

## 💻 Setup & Deployment

### 1. Clone the repository:
```bash
git clone https://github.com/codeXsidd/Student-Management.git
cd Student-Management
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
# Open a new terminal from the project root
npm install
```
Create a `.env` file in the root directory and add the following keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```
Start the development server:
```bash
npm run server
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
