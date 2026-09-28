from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.auth import auth_bp
from routes.mood import mood_bp
from routes.chat import chat_bp
from routes.habits import habits_bp
from routes.wellness import wellness_bp
from routes.profile import profile_bp
from routes.emergency import emergency_bp
from routes.dashboard import dashboard_bp

load_dotenv()

app = Flask(__name__)
frontend_url = os.getenv("FRONTEND_URL", "*")
if frontend_url == "*":
    CORS(app)
else:
    CORS(app, origins=[origin.strip() for origin in frontend_url.split(",") if origin.strip()])

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(mood_bp, url_prefix='/api/mood')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(habits_bp, url_prefix='/api/habits')
app.register_blueprint(wellness_bp, url_prefix='/api/wellness')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

@app.route('/')
def home():
    return jsonify({"message": "Mental Health Companion API is running!"})

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    upload_dir = os.path.join(os.path.dirname(__file__), 'public', 'uploads')
    return send_from_directory(upload_dir, filename)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", debug=False, port=port, use_reloader=False)
