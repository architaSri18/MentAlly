from flask import Blueprint, request, jsonify
import os
import datetime
from models.db import chats
from routes.mood import token_required
from services.ai_service import ai_service

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_message(current_user_id):
    data = request.get_json()
    user_message = data.get('message')

    # Analyze user message for context
    analysis = ai_service.analyze_mood(user_message)
    detected_emotion = analysis['emotion']

    # Empathetic Response Logic
    # Note: In a real app, you would call OpenAI/LLM here.
    # For this implementation, we'll simulate an empathetic response based on emotion.
    
    responses = {
        "joy": [
            "I'm so glad to hear that! It's wonderful that you're feeling positive.",
            "That's great news! What's making you feel so good today?",
            "It's lovely to see you in such a high spirit. Keep sharing that positivity!",
        ],
        "sadness": [
            "I'm really sorry to hear you're feeling this way. It's okay to feel sad, and I'm here for you.",
            "I hear you. It sounds like things are tough right now. Want to talk more about it?",
            "I'm sending you a virtual hug. It's perfectly fine to not be okay. I'm here to listen.",
        ],
        "anger": [
            "It sounds like you're going through a lot of frustration right now. Your feelings are valid.",
            "I can hear the frustration in your words. Take a deep breath—I'm here to support you.",
            "It's okay to feel angry. Sometimes letting it out is the first step to feeling better.",
        ],
        "fear": [
            "I understand that things feel scary right now. You're not alone in this.",
            "It's natural to feel anxious sometimes. Let's try to focus on one small thing at a time.",
            "I'm here with you. Take a moment to breathe. We can talk through what's worrying you.",
        ],
        "neutral": [
            "I hear you. Tell me more about what's on your mind.",
            "I'm listening. Please, go on.",
            "Thank you for sharing that with me. How else are you feeling?",
        ]
    }

    import random
    options = responses.get(detected_emotion, responses["neutral"])
    bot_response = random.choice(options)

    # Intent Detection: Activities/Suggestions
    request_keywords = ["suggest", "activity", "do", "how", "help", "advice", "tips", "activities", "suggestion"]
    if any(kw in user_message.lower() for kw in request_keywords):
        activities = [
            "How about a 5-minute deep breathing session? You can find it in the 'Breathing' section.",
            "Journaling your thoughts can really help. Maybe try writing down three things you're grateful for?",
            "A short walk outside could do wonders. Sometimes a change of scenery helps shift your perspective.",
            "Have you tried our mood tracker? It's a great way to see patterns in how you feel.",
            "Listening to calm music or a guided meditation can be very grounding.",
            "Reach out to one of your emergency contacts if you feel like you need someone to talk to."
        ]
        bot_response = "Of course! I'd be happy to suggest some activities. " + random.choice(activities) + " Would you like me to suggest something else?"

    # Final vibe check: if sentiment is negative but somehow we got a positive response
    elif analysis['sentiment'] == "NEGATIVE" and detected_emotion == "joy":
        bot_response = "I hear that things are difficult for you right now. I'm here to listen and support you however I can."

    chat_entry = {
        "user_id": current_user_id,
        "message": user_message,
        "response": bot_response,
        "emotion": detected_emotion,
        "timestamp": datetime.datetime.utcnow()
    }

    chats.insert_one(chat_entry)
    chat_entry['_id'] = str(chat_entry['_id'])

    return jsonify(chat_entry), 201

@chat_bp.route('/history', methods=['GET'])
@token_required
def get_chat_history(current_user_id):
    history = list(chats.find({"user_id": current_user_id}).sort("timestamp", 1))
    for entry in history:
        entry['_id'] = str(entry['_id'])
    return jsonify(history), 200
