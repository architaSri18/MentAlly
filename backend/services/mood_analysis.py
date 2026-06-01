EMOJI_ANALYSIS = {
    '😊': ('POSITIVE', 'joy'),
    '🤩': ('POSITIVE', 'joy'),
    '😐': ('NEUTRAL', 'neutral'),
    '😔': ('NEGATIVE', 'sadness'),
    '😠': ('NEGATIVE', 'anger'),
    '😨': ('NEGATIVE', 'fear'),
}

def quick_analyze(text, emoji=None):
    """Fast mood analysis — no ML wait. Used when logging moods."""
    if emoji and emoji in EMOJI_ANALYSIS:
        sentiment, emotion = EMOJI_ANALYSIS[emoji]
        return {
            'sentiment': sentiment,
            'sentiment_score': 0.85,
            'emotion': emotion,
            'emotion_score': 0.85,
        }

    text_lower = (text or '').lower()
    negative_words = ['sad', 'bad', 'angry', 'anxious', 'worried', 'tired', 'hurt', 'upset', 'stress', 'lonely']
    positive_words = ['happy', 'good', 'great', 'calm', 'peace', 'grateful', 'well', 'better', 'love']

    if any(w in text_lower for w in negative_words):
        return {'sentiment': 'NEGATIVE', 'sentiment_score': 0.75, 'emotion': 'sadness', 'emotion_score': 0.75}
    if any(w in text_lower for w in positive_words):
        return {'sentiment': 'POSITIVE', 'sentiment_score': 0.75, 'emotion': 'joy', 'emotion_score': 0.75}

    return {'sentiment': 'NEUTRAL', 'sentiment_score': 0.5, 'emotion': 'neutral', 'emotion_score': 0.5}
