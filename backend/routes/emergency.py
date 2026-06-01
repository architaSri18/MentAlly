from flask import Blueprint, request, jsonify
from models.db import db
from routes.mood import token_required
from bson.objectid import ObjectId

emergency_bp = Blueprint('emergency', __name__)
emergency_contacts = db.emergency_contacts

@emergency_bp.route('/', methods=['GET'])
@token_required
def get_contacts(current_user_id):
    contacts = list(emergency_contacts.find({"user_id": current_user_id}))
    for c in contacts:
        c['_id'] = str(c['_id'])
    return jsonify(contacts), 200

@emergency_bp.route('/', methods=['POST'])
@token_required
def add_contact(current_user_id):
    data = request.get_json()
    contact = {
        "user_id": current_user_id,
        "name": data.get('name'),
        "phone": data.get('phone'),
        "relation": data.get('relation')
    }
    emergency_contacts.insert_one(contact)
    contact['_id'] = str(contact['_id'])
    return jsonify(contact), 201

@emergency_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_contact(current_user_id, id):
    emergency_contacts.delete_one({"_id": ObjectId(id), "user_id": current_user_id})
    return jsonify({"message": "Contact deleted"}), 200
