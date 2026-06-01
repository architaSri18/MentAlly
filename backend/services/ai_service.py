from transformers import pipeline

class AIService:
    def __init__(self):
        # Using a model that handles sentiment and emotion
        # For simplicity in this demo, we'll use a standard sentiment analysis pipeline
        # and a placeholder for emotion detection.
        # In a real app, you might use 'j-hartmann/emotion-english-distilroberta-base'
        try:
            self.sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
            self.emotion_analyzer = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
        except Exception as e:
            print(f"Error loading models: {e}")
            self.sentiment_analyzer = None
            self.emotion_analyzer = None

    def analyze_mood(self, text):
        if not self.sentiment_analyzer:
            return {"sentiment": "neutral", "sentiment_score": 0, "emotion": "neutral", "emotion_score": 0}
        
        text_lower = text.lower()
        sentiment_result = self.sentiment_analyzer(text)[0]
        emotion_result = self.emotion_analyzer(text)[0] if self.emotion_analyzer else {"label": "neutral", "score": 0}

        sentiment = sentiment_result['label']
        emotion = emotion_result['label']

        # Manual Fix for common misclassifications (e.g., "not feeling well")
        negations = ["not", "don't", "cant", "can't", "no", "never", "hardly", "won't", "wont"]
        if any(neg in text_lower for neg in negations) and "well" in text_lower:
            sentiment = "NEGATIVE"
            emotion = "sadness"
        
        # Cross-validation: If sentiment is negative but emotion is joy/positive, override
        if sentiment == "NEGATIVE" and emotion in ["joy", "surprise"]:
            emotion = "neutral"

        return {
            "sentiment": sentiment,
            "sentiment_score": sentiment_result['score'],
            "emotion": emotion,
            "emotion_score": emotion_result['score']
        }

ai_service = AIService()
