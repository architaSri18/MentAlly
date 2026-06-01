from flask import Blueprint, request, jsonify
import jwt
import os
import datetime
from models.db import mood_logs
from functools import wraps
from utils.serialize import serialize_doc
from services.mood_analysis import quick_analyze

mood_bp = Blueprint('mood', __name__)
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token.split(" ")[1], JWT_SECRET, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

@mood_bp.route('/log', methods=['POST'])
@token_required
def log_mood(current_user_id):
    data = request.get_json()
    text = data.get('text')
    emoji = data.get('emoji')

    analysis = quick_analyze(text, emoji)

    log_entry = {
        "user_id": current_user_id,
        "text": text,
        "emoji": emoji,
        "sentiment": analysis['sentiment'],
        "sentiment_score": analysis['sentiment_score'],
        "emotion": analysis['emotion'],
        "emotion_score": analysis['emotion_score'],
        "timestamp": datetime.datetime.utcnow()
    }

    mood_logs.insert_one(log_entry)

    return jsonify({
        "message": "Mood logged successfully",
        "data": serialize_doc(log_entry),
    }), 201

@mood_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user_id):
    logs = list(mood_logs.find({"user_id": current_user_id}).sort("timestamp", -1))
    return jsonify(serialize_doc(logs)), 200
