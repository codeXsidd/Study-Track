# StudyTrack - Premium AI-Powered Student Workspace 🚀

StudyTrack is an all-in-one, ultra-premium personal student workspace designed to transform academic chaos into peak productivity. Powered by **Google Gemini AI**, it goes beyond simple tracking—it acts as your personal tutor, scheduler, and motivator.

## 💎 Premium Experience
- **Ultra-Modern UI:** Sleek glassmorphism, fluid animations (Slide-Scale & Fade-Up), and a mobile-first side-swiping UX.
- **Deep Focus Room:** A dedicated distraction-free zone with an integrated **AI Tutor** and background ambience.
- **Gamified Progress:** Earn XP, level up, and maintain streaks with the Activity Heartmap and Habit Tracker.

---

## ✨ Key AI & Productivity Features

### 🧠 Google Gemini AI Intelligence
- **AI Task Breakdown:** Instantly convert large study goals into small, actionable 15-30 minute subtasks.
- **AI Flashcards:** Generate interactive testing material directly from your study notes.
- **AI Tutor Chat:** Get instant explanations and analogies for complex concepts while you're in the Focus Room or AI Assistant page.
- **AI GPA Predictor:** Predictive analysis of required SGPA to hit your target CGPA, including difficulty level and strategy advice.
- **AI Journal Summarizer:** Condense long lecture notes or reading materials into concise bullet points.
- **AI Strategy Scheduler:** Analyzing your class timetable and tasks to find the best deep-work windows today.

### 📅 Core Study Suite
- **Productivity Score Graph:** A multi-dimensional chart that tracks your "Productivity Score" (weighted Study Hours + Tasks) to visualize your true academic output.
- **Dynamic Habit Builder:** A monthly visual calendar tracker with streak visualization and year-wide scroll.
- **Interactive Timetable:** Period-based weekly schedule with a "Class Now" dashboard indicator.
- **GPA/CGPA Suite:** Multi-semester performance tracking with live progression charts.
- **Study Journal:** Track study hours, mood, and achievements with a visual activity heatmap.
- **Pomodoro Timer:** Focused work cycles with automated rest intervals and XP rewards.
- **Portfolio & Certificates:** A central hub to host and showcase your academic achievements.

---

## 🛠️ Tech Stack

**Frontend:**
- **React (Vite):** Core framework for speed and modularity.
- **Tailwind CSS:** Professional styling utilities.
- **Lucide Icons:** Clean, modern iconography.
- **Chart.js:** Dynamic data visualization for GPA and attendance.
- **Google Fonts (Inter & Plus Jakarta Sans):** Premium typography.

**Backend:**
- **Node.js & Express:** Scalable API architecture.
- **MongoDB (Atlas):** Secure cloud database storing tasks, grades, and habits.
- **Google Generative AI SDK:** powers the Gemini 1.5-Flash intelligence.
- **JWT Auth:** Secure user sessions and session persistence.
- **Brevo API:** Powers the "Forgot Password" secure email reset engine.

---

## 💻 Setup & Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codeXsidd/Student-Management.git
   cd Student-Management
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_string
   JWT_SECRET=your_random_string
   GEMINI_API_KEY=your_google_ai_studio_key
   BREVO_API_KEY=your_brevo_api_key
   ```

3. **Install & Run:**
   - **Backend:** `npm run dev`
   - **Frontend:** `cd frontend && npm run dev`

---

## 📜 License & Contribution
This project is open-source and designed to help students worldwide. Contributions to UI improvements or new AI modules (like OCR note scanning!) are highly welcome.

**Built with ❤️ for students who want to master their time.**
