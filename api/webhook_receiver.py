"""
Bitcoin Overloard Webhook Receiver API

This module provides webhook endpoints for receiving updates from local systems
and serving data to the dashboard.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for dashboard access

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data storage
DATA_FILE = Path(__file__).parent / 'data' / 'latest_data.json'
DATA_FILE.parent.mkdir(exist_ok=True)

# Initialize with default data
DEFAULT_DATA = {
    "btc_price": 0,
    "btc_change_24h": 0,
    "ai_sentiment": "Unknown",
    "sentiment_score": 50,
    "market_trend": "Unknown",
    "trend_confidence": 0,
    "consensus_score": 0,
    "active_models": 0,
    "predictions": [],
    "patterns": [],
    "signals": [],
    "reports": [],
    "last_updated": None
}


def load_data():
    """Load the latest data from file"""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading data: {e}")
    return DEFAULT_DATA.copy()


def save_data(data):
    """Save data to file"""
    try:
        data['last_updated'] = datetime.utcnow().isoformat()
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving data: {e}")
        return False


@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        "name": "Bitcoin Overloard Webhook API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/data": "Get current dashboard data",
            "POST /api/webhook": "Receive updates from local system",
            "POST /api/webhook/price": "Update Bitcoin price data",
            "POST /api/webhook/predictions": "Update AI predictions",
            "POST /api/webhook/patterns": "Update pattern detections",
            "POST /api/webhook/signals": "Add trading signals",
            "POST /api/webhook/reports": "Add generated reports",
            "GET /api/health": "Health check endpoint"
        }
    })


@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route('/api/data')
def get_data():
    """Get current dashboard data"""
    data = load_data()
    return jsonify(data)


@app.route('/api/webhook', methods=['POST'])
def webhook_general():
    """
    General webhook endpoint for receiving comprehensive updates
    
    Expected JSON format:
    {
        "btc_price": 43750.25,
        "btc_change_24h": 2.47,
        "ai_sentiment": "Bullish",
        "sentiment_score": 72,
        "market_trend": "Uptrend",
        "trend_confidence": 85,
        "consensus_score": 78,
        "active_models": 5,
        "predictions": [...],
        "patterns": [...],
        "signals": [...],
        "reports": [...]
    }
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        # Load current data
        current_data = load_data()
        
        # Update with new data
        current_data.update(payload)
        
        # Save updated data
        if save_data(current_data):
            return jsonify({
                "status": "success",
                "message": "Data updated successfully",
                "timestamp": datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({"error": "Failed to save data"}), 500
            
    except Exception as e:
        logger.error(f"Error in webhook: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/webhook/price', methods=['POST'])
def webhook_price():
    """
    Update Bitcoin price data
    
    Expected JSON format:
    {
        "btc_price": 43750.25,
        "btc_change_24h": 2.47
    }
    """
    try:
        payload = request.get_json()
        if not payload or 'btc_price' not in payload:
            return jsonify({"error": "btc_price is required"}), 400
        
        current_data = load_data()
        current_data['btc_price'] = payload['btc_price']
        
        if 'btc_change_24h' in payload:
            current_data['btc_change_24h'] = payload['btc_change_24h']
        
        save_data(current_data)
        return jsonify({"status": "success", "message": "Price updated"}), 200
        
    except Exception as e:
        logger.error(f"Error updating price: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/webhook/predictions', methods=['POST'])
def webhook_predictions():
    """
    Update AI model predictions
    
    Expected JSON format:
    {
        "predictions": [
            {"model": "LSTM Neural Net", "value": "$44,200", "confidence": 82},
            {"model": "Random Forest", "value": "$43,950", "confidence": 76}
        ]
    }
    """
    try:
        payload = request.get_json()
        if not payload or 'predictions' not in payload:
            return jsonify({"error": "predictions array is required"}), 400
        
        current_data = load_data()
        current_data['predictions'] = payload['predictions']
        
        # Update active models count
        current_data['active_models'] = len(payload['predictions'])
        
        save_data(current_data)
        return jsonify({"status": "success", "message": "Predictions updated"}), 200
        
    except Exception as e:
        logger.error(f"Error updating predictions: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/webhook/patterns', methods=['POST'])
def webhook_patterns():
    """
    Update detected patterns
    
    Expected JSON format:
    {
        "patterns": [
            {"name": "Bullish Engulfing", "detected": "2h ago", "confidence": "High"}
        ]
    }
    """
    try:
        payload = request.get_json()
        if not payload or 'patterns' not in payload:
            return jsonify({"error": "patterns array is required"}), 400
        
        current_data = load_data()
        current_data['patterns'] = payload['patterns']
        
        save_data(current_data)
        return jsonify({"status": "success", "message": "Patterns updated"}), 200
        
    except Exception as e:
        logger.error(f"Error updating patterns: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/webhook/signals', methods=['POST'])
def webhook_signals():
    """
    Add trading signals
    
    Expected JSON format:
    {
        "signal": {
            "time": "14:23",
            "text": "Strong buy signal detected",
            "type": "bullish"
        }
    }
    """
    try:
        payload = request.get_json()
        if not payload or 'signal' not in payload:
            return jsonify({"error": "signal object is required"}), 400
        
        current_data = load_data()
        
        # Initialize signals array if it doesn't exist
        if 'signals' not in current_data:
            current_data['signals'] = []
        
        # Add new signal to the beginning
        current_data['signals'].insert(0, payload['signal'])
        
        # Keep only the last 20 signals
        current_data['signals'] = current_data['signals'][:20]
        
        save_data(current_data)
        return jsonify({"status": "success", "message": "Signal added"}), 200
        
    except Exception as e:
        logger.error(f"Error adding signal: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/webhook/reports', methods=['POST'])
def webhook_reports():
    """
    Add generated reports
    
    Expected JSON format:
    {
        "report": {
            "name": "Daily Market Analysis",
            "date": "2025-11-13",
            "time": "08:00"
        }
    }
    """
    try:
        payload = request.get_json()
        if not payload or 'report' not in payload:
            return jsonify({"error": "report object is required"}), 400
        
        current_data = load_data()
        
        # Initialize reports array if it doesn't exist
        if 'reports' not in current_data:
            current_data['reports'] = []
        
        # Add new report to the beginning
        current_data['reports'].insert(0, payload['report'])
        
        # Keep only the last 10 reports
        current_data['reports'] = current_data['reports'][:10]
        
        save_data(current_data)
        return jsonify({"status": "success", "message": "Report added"}), 200
        
    except Exception as e:
        logger.error(f"Error adding report: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    # Initialize data file if it doesn't exist
    if not DATA_FILE.exists():
        save_data(DEFAULT_DATA)
    
    # Run the Flask app (debug mode disabled for security)
    # For development, set FLASK_ENV=development environment variable
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
