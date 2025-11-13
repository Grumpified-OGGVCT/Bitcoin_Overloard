#!/usr/bin/env python3
"""
Example webhook client for Bitcoin Overloard Dashboard

This script demonstrates how to send updates to the dashboard from your local system.
"""

import requests
import time
import random
from datetime import datetime


class DashboardClient:
    """Client for sending updates to Bitcoin Overloard dashboard"""
    
    def __init__(self, api_url="http://localhost:5000"):
        self.api_url = api_url
        
    def send_price_update(self, price, change_24h):
        """Send Bitcoin price update"""
        endpoint = f"{self.api_url}/api/webhook/price"
        data = {
            "btc_price": price,
            "btc_change_24h": change_24h
        }
        response = requests.post(endpoint, json=data)
        return response.json()
    
    def send_predictions(self, predictions):
        """Send AI model predictions"""
        endpoint = f"{self.api_url}/api/webhook/predictions"
        data = {"predictions": predictions}
        response = requests.post(endpoint, json=data)
        return response.json()
    
    def send_pattern(self, patterns):
        """Send detected patterns"""
        endpoint = f"{self.api_url}/api/webhook/patterns"
        data = {"patterns": patterns}
        response = requests.post(endpoint, json=data)
        return response.json()
    
    def send_signal(self, signal):
        """Send trading signal"""
        endpoint = f"{self.api_url}/api/webhook/signals"
        data = {"signal": signal}
        response = requests.post(endpoint, json=data)
        return response.json()
    
    def send_report(self, report):
        """Send generated report"""
        endpoint = f"{self.api_url}/api/webhook/reports"
        data = {"report": report}
        response = requests.post(endpoint, json=data)
        return response.json()
    
    def send_comprehensive_update(self, data):
        """Send comprehensive update with all data"""
        endpoint = f"{self.api_url}/api/webhook"
        response = requests.post(endpoint, json=data)
        return response.json()


def simulate_data_stream():
    """Simulate a data stream sending updates to the dashboard"""
    client = DashboardClient()
    
    # Base price for simulation
    base_price = 43500
    
    print("Starting Bitcoin Overloard data stream simulator...")
    print(f"Sending updates to dashboard every 5 seconds")
    print("Press Ctrl+C to stop\n")
    
    try:
        iteration = 0
        while True:
            iteration += 1
            
            # Simulate price changes
            price_change = random.uniform(-500, 500)
            current_price = base_price + price_change
            change_24h = random.uniform(-5, 5)
            
            # Create predictions
            predictions = [
                {
                    "model": "LSTM Neural Net",
                    "value": f"${current_price + random.uniform(-200, 300):.2f}",
                    "confidence": random.randint(75, 90)
                },
                {
                    "model": "Random Forest",
                    "value": f"${current_price + random.uniform(-150, 250):.2f}",
                    "confidence": random.randint(70, 85)
                },
                {
                    "model": "XGBoost",
                    "value": f"${current_price + random.uniform(-180, 280):.2f}",
                    "confidence": random.randint(72, 88)
                },
                {
                    "model": "ARIMA",
                    "value": f"${current_price + random.uniform(-100, 200):.2f}",
                    "confidence": random.randint(65, 80)
                },
                {
                    "model": "Transformer",
                    "value": f"${current_price + random.uniform(-220, 320):.2f}",
                    "confidence": random.randint(78, 92)
                }
            ]
            
            # Determine sentiment
            if change_24h > 2:
                sentiment = "Bullish"
                sentiment_score = 70 + random.randint(0, 20)
            elif change_24h < -2:
                sentiment = "Bearish"
                sentiment_score = 20 + random.randint(0, 20)
            else:
                sentiment = "Neutral"
                sentiment_score = 45 + random.randint(0, 15)
            
            # Create comprehensive update
            update_data = {
                "btc_price": round(current_price, 2),
                "btc_change_24h": round(change_24h, 2),
                "ai_sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "market_trend": "Uptrend" if change_24h > 0 else "Downtrend",
                "trend_confidence": random.randint(70, 95),
                "consensus_score": random.randint(65, 85),
                "active_models": len(predictions),
                "predictions": predictions
            }
            
            # Send update
            result = client.send_comprehensive_update(update_data)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Update #{iteration}: "
                  f"BTC ${current_price:.2f} ({change_24h:+.2f}%) - {sentiment} - {result['status']}")
            
            # Occasionally send a signal
            if iteration % 3 == 0:
                signal = {
                    "time": datetime.now().strftime('%H:%M'),
                    "text": random.choice([
                        "Strong buy signal detected",
                        "Resistance level broken",
                        "Volume spike observed",
                        "Support level holding",
                        "Momentum increasing"
                    ]),
                    "type": random.choice(["bullish", "bearish", "neutral"])
                }
                client.send_signal(signal)
                print(f"  → Signal: {signal['text']}")
            
            # Occasionally send patterns
            if iteration % 5 == 0:
                patterns = [
                    {
                        "name": random.choice([
                            "Bullish Engulfing",
                            "Golden Cross Forming",
                            "Volume Spike",
                            "Double Bottom",
                            "Cup and Handle"
                        ]),
                        "detected": f"{random.randint(1, 5)}h ago",
                        "confidence": random.choice(["High", "Medium", "Low"])
                    }
                ]
                client.send_pattern(patterns)
                print(f"  → Pattern: {patterns[0]['name']} ({patterns[0]['confidence']} confidence)")
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n\nSimulation stopped.")
    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure the webhook API is running on http://localhost:5000")


if __name__ == "__main__":
    simulate_data_stream()
