# Real-Time Q&A Dashboard 🚀

A modern, real-time Question & Answer platform featuring **live updates**, **AI-powered sentiment analysis**, and **smart answer suggestions**. built with **FastAPI**, **Next.js**, and **OpenAI**.

![Status](https://img.shields.io/badge/Status-Completed-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **Real-Time Capabilities**: Questions and answers appear instantly for all users via WebSockets.
- **AI Integration**:
  - **Sentiment Analysis**: Automatically detects if a question is Positive, Neutral, or Negative.
  - **AI Suggestions**: Admins can request AI-generated answers for complex questions.
- **Modern UI**:
  - **Dark "Glassy" Aesthetic**: Premium black-and-white theme with frosted glass effects.
  - **Responsive Design**: Mobile-friendly layout using Tailwind CSS v4.
- **Role-Based Access**:
  - **Guests**: Can post questions and view answers.
  - **Admins**: Can answer questions, escalate issues, and use AI tools.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Auth**: JWT with Argon2 hashing
- **Real-time**: WebSocket (Starlette/FastAPI)
- **AI**: OpenAI API (`gpt-4o-mini`)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Icons**: Lucide React
- **State**: React Hooks + Context API

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose (Recommended)
- OR Node.js v20+ & Python 3.11+ (Manual)
- OpenAI API Key

### Option 1: Run with Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/qa-dashboard.git
   cd qa-dashboard
   ```

2. **Configure Environment**:
   Create a `.env` file in the `server/` directory (or root if using docker-compose env mapping):
   ```env
   SECRET_KEY=your_super_secret_key
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

3. **Start the App**:
   ```bash
   docker-compose up --build
   ```

4. **Access the App**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Manual Setup

#### Backend
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Ensure .env exists in server/
uvicorn main:app --reload
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🔑 Default Credentials

To access Admin features (AI Suggest, Status Management):

- **Username**: `admin`
- **Password**: `admin123`

*(Note: If these don't work, check `server/seed_admin.py` or run `python seed_admin.py` inside the server directory)*

## 📂 Project Structure

```
├── client/                 # Next.js Frontend
│   ├── app/                # App Router pages
│   ├── components/         # React Components (Glassy UI)
│   └── public/             # Static assets
├── server/                 # FastAPI Backend
│   ├── routers/            # API Endpoints (Auth, Questions)
│   ├── models.py           # Database Models
│   ├── schemas.py          # Pydantic Schemas
│   └── main.py             # App Entry point
├── docker-compose.yml      # Docker Orchestration
└── README.md               # Project Documentation
```

## 🧪 CI/CD

This project includes a **GitHub Actions** pipeline (`.github/workflows/ci.yml`) that runs on every push to `main`, verifying:
- Backend dependency installation
- Frontend build process
- Docker image construction

---

# AnswerFlow-AI
