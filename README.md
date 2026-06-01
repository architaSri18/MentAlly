# 🧠 MentAlly - Mental Health & Wellness Tracker

A comprehensive full-stack web application designed to help users track their mental health, build positive habits, and access wellness resources. MentAlly provides a personalized dashboard with mood tracking, habit building, AI-powered chat support, and emergency resources.

## ✨ Features

### 📊 Dashboard
- Personalized wellness overview
- Mood trend visualization
- Quick stats and insights
- Daily wellness score

### 😊 Mood Tracking
- Daily mood logging with detailed notes
- Mood history and trend analysis
- Visual charts showing mood patterns over time
- AI-powered mood insights

### 🎯 Habit Building
- Create and track daily habits
- Progress visualization
- Streak tracking
- Habit completion statistics

### 💬 AI Chat Support
- AI-powered wellness conversations
- 24/7 mental health support
- Personalized recommendations
- Safe and confidential environment

### 🚨 Emergency Resources
- Quick access to emergency contacts
- Crisis helpline numbers
- Safety planning tools
- Immediate support resources

### 👤 User Profile
- Personalized settings
- Progress tracking
- Account management
- Privacy controls

### 📝 Wellness Journal
- Daily journaling
- Reflection prompts
- Wellness goal tracking
- Progress notes

## 🛠️ Tech Stack

### Backend
- **Python Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **MongoDB** - NoSQL database with PyMongo driver
- **JWT + Bcrypt** - Secure authentication and password hashing

### Frontend
- **React.js v18+** - UI framework
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Vanilla CSS** - Custom styling with glassmorphism design

## 📁 Project Structure

```
MentAlly/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic & AI services
│   ├── utils/            # Utility functions
│   ├── app.py            # Flask application entry point
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API service functions
│   │   └── utils/        # Utility functions
│   └── package.json      # Node dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory with the following:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///mentally.db
AI_API_KEY=your-ai-api-key
```

5. Run the backend server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Authentication

MentAlly uses JWT (JSON Web Tokens) for secure authentication. Users need to register and login to access their personalized dashboard and tracking features.

## 🤖 AI Features

- **Mood Analysis**: AI analyzes mood patterns and provides insights
- **Chat Support**: Conversational AI for mental health support
- **Personalized Recommendations**: Based on user behavior and mood trends

## 🛡️ Privacy & Security

- All user data is encrypted and stored securely
- JWT-based authentication for secure sessions
- Local database storage for privacy
- No third-party data sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
