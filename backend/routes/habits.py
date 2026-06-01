from flask import Blueprint, request, jsonify
import os
import datetime
from models.db import habits, tasks
from routes.mood import token_required
from utils.serialize import serialize_doc

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/habits', methods=['POST'])
@token_required
def create_habit(current_user_id):
    data = request.get_json()
    habit = {
        "user_id": current_user_id,
        "name": data.get('name'),
        "streak": 0,
        "last_logged": None,
        "created_at": datetime.datetime.utcnow()
    }
    habits.insert_one(habit)
    return jsonify(serialize_doc(habit)), 201

@habits_bp.route('/habits', methods=['GET'])
@token_required
def get_habits(current_user_id):
    user_habits = list(habits.find({"user_id": current_user_id}))
    return jsonify(serialize_doc(user_habits)), 200

@habits_bp.route('/tasks', methods=['POST'])
@token_required
def create_task(current_user_id):
    data = request.get_json()
    task = {
        "user_id": current_user_id,
        "text": data.get('text'),
        "completed": False,
        "created_at": datetime.datetime.utcnow()
    }
    tasks.insert_one(task)
    return jsonify(serialize_doc(task)), 201

@habits_bp.route('/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_id):
    user_tasks = list(tasks.find({"user_id": current_user_id}))
    return jsonify(serialize_doc(user_tasks)), 200

@habits_bp.route('/tasks/<id>', methods=['PATCH'])
@token_required
def update_task(current_user_id, id):
    data = request.get_json()
    from bson.objectid import ObjectId
    tasks.update_one({"_id": ObjectId(id), "user_id": current_user_id}, {"$set": {"completed": data.get('completed')}})
    return jsonify({"message": "Task updated"}), 200
