# StudyTrack - Personal Student Workspace 🚀

StudyTrack is an all-in-one personal student workspace designed to help students track their academic progress visually and easily. Never miss a class, forget an assignment deadline, or lose track of your CGPA again.

![StudyTrack Banner](frontend/public/vite.svg) {/* Optional: Update with actual screenshot */}

## ✨ Features

- **Attendance Tracker:** Mark daily attendance and track whether your percentage meets the required thresholds (e.g., 75%). Visual warnings for low attendance.
- **Smart Timetable:** Interactive weekly timetable customized by number of periods and schedule. See "Today's Classes" directly on your dashboard.
- **Assignment & Deadlines Tracker:** Keep a to-do list with color-coded urgency based on impending deadlines.
- **GPA / CGPA Calculator:** Track your performance across all semesters dynamically.
- **Study Journal:** Log your daily study hours and mood to build a heatmap/streak of pure academic grinding.
- **Pomodoro Timer:** Built-in productivity timer tailored to study intervals.
- **Portfolio & Certificates Management:** Safely upload your achievements and manage projects in a single hub.
- **Mobile Responsive Design:** The entire platform is built with a mobile-first, side-swiping UX so it works beautifully on your phone or your dorm PC.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (via pure vanilla integrations and utility plugins)
- React Router DOM for easy SPA navigation
- Lucide React (Icons)
- Chart.js / React-ChartJS-2 (Visual Data)
- Axios (API Client)

**Backend:**
- Node.js & Express
- MongoDB (Mongoose ORM)
- JWT Authentication (JSON Web Tokens)
- Nodemailer (Password recovery with configured timeouts)

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your device. You will also need a MongoDB URI if you plan on running your own disconnected instance.

### 1. Clone the repository
```bash
git clone https://github.com/codeXsidd/Student-Management.git
cd Student-Management
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder with the following keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
NODE_ENV=development
```

### 3. Install Dependencies & Run (Locally)
To run both the backend API and the Vite React frontend simultaneously:

Open **two** terminals.
Terminal 1 (Backend):
```bash
npm install
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

Your app should now be running locally at `http://localhost:5173/`.

### 4. Production Build
If you wish to deploy the system, remember to configure Vercel for the frontend, and run standard Node build scripts for your backend host (like Render, Railway, or Heroku).

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! If you'd like to improve the UI or add a new module (like a Flashcard system!), feel free to fork this repository.

## 📜 License
This project is open-source and free to be adapted for educational and personal use.
