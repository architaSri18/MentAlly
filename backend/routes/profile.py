from flask import Blueprint, request, jsonify
import os
from models.db import users
from routes.mood import token_required
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

UPLOAD_FOLDER = 'public/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@profile_bp.route('/me', methods=['GET'])
@token_required
def get_profile(current_user_id):
    from bson.objectid import ObjectId
    user = users.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        "name": user.get('name'),
        "email": user.get('email'),
        "dob": user.get('dob', ''),
        "gender": user.get('gender', ''),
        "country": user.get('country', ''),
        "profile_image": user.get('profile_image', '')
    }), 200

@profile_bp.route('/update', methods=['POST'])
@token_required
def update_profile(current_user_id):
    from bson.objectid import ObjectId
    data = request.form
    
    update_data = {
        "name": data.get('name'),
        "dob": data.get('dob'),
        "gender": data.get('gender'),
        "country": data.get('country')
    }

    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            filename = secure_filename(f"{current_user_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            update_data['profile_image'] = f"/uploads/{filename}"

    users.update_one({"_id": ObjectId(current_user_id)}, {"$set": update_data})
    return jsonify({"message": "Profile updated successfully"}), 200
