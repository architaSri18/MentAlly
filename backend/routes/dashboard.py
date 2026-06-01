from flask import Blueprint, jsonify
from models.db import mood_logs, habits, tasks, assessments, breathing_logs
from routes.mood import token_required
from utils.serialize import serialize_doc

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    moods = list(
        mood_logs.find({"user_id": current_user_id}).sort("timestamp", -1).limit(20)
    )
    user_habits = list(habits.find({"user_id": current_user_id}))
    user_tasks = list(tasks.find({"user_id": current_user_id}))
    user_assessments = list(
        assessments.find({"user_id": current_user_id}).sort("timestamp", -1).limit(10)
    )
    user_breathing = list(
        breathing_logs.find({"user_id": current_user_id}).sort("timestamp", -1).limit(20)
    )
    latest_assessment = user_assessments[0] if user_assessments else None

    return jsonify({
        "moods": serialize_doc(moods),
        "habits": serialize_doc(user_habits),
        "tasks": serialize_doc(user_tasks),
        "assessments": serialize_doc(user_assessments),
        "assessment": serialize_doc(latest_assessment) if latest_assessment else {"score": 0},
        "breathing": serialize_doc(user_breathing),
        "counts": {
            "moods": mood_logs.count_documents({"user_id": current_user_id}),
            "habits": len(user_habits),
            "tasks": len(user_tasks),
            "tasks_done": sum(1 for t in user_tasks if t.get("completed")),
            "assessments": assessments.count_documents({"user_id": current_user_id}),
            "breathing_sessions": len(user_breathing) if user_breathing else breathing_logs.count_documents({"user_id": current_user_id}),
        },
    }), 200
