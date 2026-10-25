## License
   © 2026 Elhabchi Mohammed. All Rights Reserved.

# LittleGenius 🦊
### AI Learning Platform for Kids (MERN Stack Edition)

LittleGenius is an interactive educational platform designed to make learning engaging and accessible for children aged 6 to 12. It provides teachers with AI-assisted tools to create and structure educational courses, while giving students a playful, interactive learning experience with instant feedback, gamification, and retry support.

---

## 🌟 Key Features

### 👩‍🏫 1. Teacher Management & Curriculum Authoring
- **Hierarchical Content Structure**: `Course` ➔ `Chapters` ➔ `Sections` ➔ `Activities`.
- **Draft & Publish Workflows**: Build lessons as drafts before publishing to selected classes.
- **Class & Student Account Management**: Create classrooms, assign courses, and generate student logins.
- **Manual & AI-Assisted Activity Creation**:
  - Multiple-Choice Quizzes (with options, hints, and kid-friendly explanations).
  - Matching Games (drag & click terms to definitions / concepts).
  - Fill in the Blanks (interactive word bank chips and sentence completion).
- **Teacher-in-the-Loop Validation**: Review, customize, regenerate, and approve AI-generated activities before publishing.

### 🎒 2. Child-Friendly Learning Environment (Ages 6 to 12)
- **Playful Design**: Cheerful colors, large readable typography, mascot avatars (🦊 Fox, 🦉 Owl, 🐻 Bear, 🦁 Lion).
- **Interactive Exercise Players**:
  - Instant positive reinforcement and congratulatory confetti.
  - Interactive sound effects synthesized in real-time with Web Audio API (no external asset dependencies).
  - Encouraging explanations provided for every mistake so children learn why an answer is right or wrong.
- **Activity Retries**: Repeat exercises for practice while tracking historical attempts and best scores.
- **Gamification**: Total Points, Day Streaks, and Badges Trophy Cabinet (*Curious Learner*, *Star Genius*, *Never Give Up*).

### 🤖 3. Intelligent AI Service Module
- Implemented within the Express.js backend as a dedicated service layer (`server/services/aiService.js`).
- Multi-provider support:
  - **Google Gemini API** (`GEMINI_API_KEY`)
  - **Groq API** (`GROQ_API_KEY`)
  - **OpenAI API** (`OPENAI_API_KEY`)
  - **Built-in Smart Pedagogical Rule Engine**: Zero-configuration offline fallback that extracts concepts, generates questions, distractors, and explanations automatically.
- Strict JSON schema validation ensuring safe, validated activity structures.

### 📊 4. Learning Analytics & Diagnostics
- Real-time class course completion rates.
- Average activity scores across attempts.
- **Automatic Misconception Spotter**: Detects topics with recurring difficulties (e.g. Quarters in Fractions) with direct shortcut to generate reinforcement practice exercises.
- Student-by-student drilldown table with "Needs Attention" alerts.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, JWT Authentication, bcryptjs, Morgan |
| **Database** | MongoDB with Mongoose ODM |
| **AI Integration** | Express-native AI Service (Gemini / Groq / OpenAI / Smart Rule Engine) |
| **Audio** | HTML5 Web Audio API synthesizer |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Installation
Clone the repository and install all dependencies:
```bash
# In the project root directory
npm run install-all
```



### 3. Seed Database with Demonstration Scenario
Populate the database with the example scenario described in the project specifications:
```bash
npm run seed
```

This creates:
- **Teacher Account**: `teacher@littlegenius.edu` / `Password123!` (Sarah Vance)
- **Class**: *Grade 4 - Explorers*
- **Students**:
  - `adam@littlegenius.edu` / `Student123!` (Adam Jenkins - has completed Chapter 2 Section 1 with struggle on quarters)
  - `emma@littlegenius.edu` / `Student123!` (Emma Watson - 100% score)
  - `lucas@littlegenius.edu` / `Student123!`
  - `maya@littlegenius.edu` / `Student123!`
- **Courses**:
  - *Introduction to Fractions* (Mathematics - 3 Chapters, Sections, Quizzes, Matching, Fill-in-the-blanks)
  - *Solar System Explorers* (Science)
  - *Grammar Detectives: Nouns & Verbs* (Language Arts - Draft mode)

### 4. Running the Application
Start both the backend API and frontend in parallel:
```bash
npm run dev
```

Open your browser at:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/api/health`

---

## 🧪 Demonstration Walkthrough (End-to-End Scenario)

1. **Teacher Overview**:
   - Go to `http://localhost:3000` and click **"Teacher Sarah"** for 1-click login.
   - The dashboard alerts that students experienced difficulties in *Exploring Halves and Quarters*.
   - Click **Progress Analytics** to inspect Adam's and Lucas's struggles with quarters.
   - Click **Courses & AI** ➔ open *Introduction to Fractions* ➔ create a new Section or click **"Generate with AI ✨"** to create a tailored practice activity.
   - Review questions, edit options, approve, and save to the lesson.

2. **Student Experience**:
   - Log out or open an incognito window at `http://localhost:3000` and click **"Student Adam"**.
   - Adam sees his points, streak, and assigned courses.
   - Click **"Introduction to Fractions"** ➔ Chapter 2: *Halves and Quarters*.
   - Review the lesson explanation and open the Quiz or Matching activity.
   - Answer questions and receive instant positive feedback with detailed explanations.
   - Click **"Try Again for Practice"** to practice and improve score.

---

## 🚢 Deployment Guide

### Backend (Render / Railway)
1. Set the root directory to `server` or configure start command `node server/server.js`.
2. Configure Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `PORT=5001`, `NODE_ENV=production`.
3. If using external AI, add `GEMINI_API_KEY` or `GROQ_API_KEY`.

### Frontend (Vercel / Netlify)
1. Set framework to **Vite**.
2. Root directory: `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Rewrite `/api/*` requests to your deployed backend URL.

---

## 📄 License
MIT License - Created for the LittleGenius Educational Platform.
