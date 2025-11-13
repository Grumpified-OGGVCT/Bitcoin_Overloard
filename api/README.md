# Bitcoin Overloard Webhook API

Flask-based webhook receiver for the Bitcoin Overloard intelligence system.

## Overview

This API serves two primary purposes:
1. Receive updates from local trading systems via webhooks
2. Provide data to the dashboard for real-time visualization

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python webhook_receiver.py
```

The server will start on `http://localhost:5000`

## Configuration

### Environment Variables

- `FLASK_ENV`: Set to `development` for debug mode
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0)

## API Endpoints

### General

- `GET /` - API root with endpoint documentation
- `GET /api/health` - Health check endpoint

### Data Access

- `GET /api/data` - Retrieve current dashboard data

### Webhook Receivers

- `POST /api/webhook` - General webhook for comprehensive updates
- `POST /api/webhook/price` - Update price data
- `POST /api/webhook/predictions` - Update AI predictions
- `POST /api/webhook/patterns` - Update pattern detections
- `POST /api/webhook/signals` - Add trading signals
- `POST /api/webhook/reports` - Add generated reports

## Data Storage

Data is stored in JSON format at `api/data/latest_data.json`. This file is automatically created on first run.

## Example Integration

### Python Script

```python
import requests
import time

API_URL = "http://localhost:5000"

def send_price_update(price, change):
    """Send price update to dashboard"""
    response = requests.post(
        f"{API_URL}/api/webhook/price",
        json={
            "btc_price": price,
            "btc_change_24h": change
        }
    )
    return response.json()

def send_prediction(model_name, predicted_value, confidence):
    """Send AI prediction update"""
    response = requests.post(
        f"{API_URL}/api/webhook/predictions",
        json={
            "predictions": [{
                "model": model_name,
                "value": predicted_value,
                "confidence": confidence
            }]
        }
    )
    return response.json()

# Example usage
while True:
    # Your trading logic here
    current_price = get_bitcoin_price()  # Your function
    change_24h = calculate_change()      # Your function
    
    # Update dashboard
    send_price_update(current_price, change_24h)
    
    time.sleep(10)  # Update every 10 seconds
```

## CORS

CORS is enabled for all origins to allow dashboard access. In production, configure this to only allow specific origins.

## Production Deployment

For production deployment, consider:

1. Use a production WSGI server (Gunicorn, uWSGI)
2. Set up proper authentication
3. Configure CORS for specific origins only
4. Use environment variables for configuration
5. Set up logging and monitoring
6. Use HTTPS
7. Add rate limiting

Example with Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 webhook_receiver:app
```

## Security Recommendations

1. **Authentication**: Add API key or token-based authentication
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all incoming webhook data
4. **HTTPS**: Use SSL/TLS in production
5. **CORS**: Restrict CORS to specific domains
6. **Logging**: Log all webhook requests for audit

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `500 Internal Server Error` - Server error

Error responses include a JSON body with error details:

```json
{
  "error": "Description of the error"
}
```

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get current data
curl http://localhost:5000/api/data

# Send price update
curl -X POST http://localhost:5000/api/webhook/price \
  -H "Content-Type: application/json" \
  -d '{"btc_price": 43750.25, "btc_change_24h": 2.47}'

# Send comprehensive update
curl -X POST http://localhost:5000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "btc_price": 43750.25,
    "btc_change_24h": 2.47,
    "ai_sentiment": "Bullish",
    "sentiment_score": 72
  }'
```
