# Bitcoin Overloard 🚀

**AI-powered cryptocurrency trading intelligence system with real-time dashboard**

Bitcoin Overloard provides multi-model consensus analysis, real-time market data collection, paper trading sandbox, and a comprehensive web dashboard. Features convergence cycles, pattern detection, prediction tracking, and automated report generation.

## 🌟 Features

### Intelligence Dashboard
- **Real-time Bitcoin Price Tracking**: Live price updates with 24h change percentage
- **AI Sentiment Analysis**: Multi-model consensus sentiment with visual indicators
- **Market Trend Detection**: Automated trend analysis with confidence scores
- **Pattern Recognition**: Detect bullish/bearish patterns in real-time
- **Trading Signals**: Automated signals based on AI analysis
- **Interactive Charts**: Price and prediction timeline visualization
- **Automated Reports**: Generated market analysis reports

### Technical Capabilities
- Multi-model AI predictions (LSTM, Random Forest, XGBoost, ARIMA, Transformer)
- Pattern detection algorithms
- Real-time data streaming via webhooks
- RESTful API for data access
- GitHub Pages hosted dashboard
- Auto-deployment on push

## 🚀 Quick Start

### View the Dashboard

Visit the live dashboard at: **https://grumpified-oggvct.github.io/Bitcoin_Overloard/**

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Grumpified-OGGVCT/Bitcoin_Overloard.git
   cd Bitcoin_Overloard
   ```

2. **Open the dashboard**
   ```bash
   # Open index.html in your browser
   open index.html
   # or
   python -m http.server 8000
   # Then visit http://localhost:8000/
   ```

3. **Run the webhook API (optional)**
   ```bash
   cd api
   pip install -r requirements.txt
   python webhook_receiver.py
   ```

## 📁 Project Structure

```
Bitcoin_Overloard/
├── index.html                 # Main dashboard HTML (GitHub Pages root)
├── static/                    # Static assets
│   ├── css/
│   │   └── dashboard.css     # Dashboard styling
│   ├── js/
│   │   └── dashboard.js      # Dashboard logic & real-time updates
│   └── images/               # Image assets
├── assets/                    # Payment QR codes and images
│   ├── KofiTipQR_Code_GrumpiFied.png
│   └── lightning_wallet_QR_Code.png
├── docs/                      # Additional documentation (optional)
│   └── index.html            # Alternative dashboard location
├── api/                       # Webhook handlers
│   ├── webhook_receiver.py   # Flask API server
│   ├── requirements.txt      # Python dependencies
│   └── data/                 # Data storage (auto-created)
├── .github/
│   └── workflows/
│       └── deploy-pages.yml  # Auto-deployment workflow
└── README.md                 # This file
```

## 📡 API Documentation

### Base URL
When running locally: `http://localhost:5000`

### Endpoints

#### GET `/api/data`
Get current dashboard data

**Response:**
```json
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
```

#### POST `/api/webhook`
General webhook for comprehensive updates

**Request Body:**
```json
{
  "btc_price": 43750.25,
  "btc_change_24h": 2.47,
  "ai_sentiment": "Bullish",
  "sentiment_score": 72,
  "predictions": [
    {"model": "LSTM Neural Net", "value": "$44,200", "confidence": 82}
  ]
}
```

#### POST `/api/webhook/price`
Update Bitcoin price data

**Request Body:**
```json
{
  "btc_price": 43750.25,
  "btc_change_24h": 2.47
}
```

#### POST `/api/webhook/predictions`
Update AI model predictions

**Request Body:**
```json
{
  "predictions": [
    {"model": "LSTM Neural Net", "value": "$44,200", "confidence": 82},
    {"model": "Random Forest", "value": "$43,950", "confidence": 76}
  ]
}
```

#### POST `/api/webhook/patterns`
Update detected patterns

**Request Body:**
```json
{
  "patterns": [
    {"name": "Bullish Engulfing", "detected": "2h ago", "confidence": "High"}
  ]
}
```

#### POST `/api/webhook/signals`
Add trading signals

**Request Body:**
```json
{
  "signal": {
    "time": "14:23",
    "text": "Strong buy signal detected",
    "type": "bullish"
  }
}
```

#### POST `/api/webhook/reports`
Add generated reports

**Request Body:**
```json
{
  "report": {
    "name": "Daily Market Analysis",
    "date": "2025-11-13",
    "time": "08:00"
  }
}
```

#### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T16:30:00.000Z"
}
```

## 🔧 Usage Examples

### Send Price Update via cURL
```bash
curl -X POST http://localhost:5000/api/webhook/price \
  -H "Content-Type: application/json" \
  -d '{"btc_price": 43750.25, "btc_change_24h": 2.47}'
```

### Send Price Update via Python
```python
import requests

data = {
    "btc_price": 43750.25,
    "btc_change_24h": 2.47
}

response = requests.post(
    "http://localhost:5000/api/webhook/price",
    json=data
)
print(response.json())
```

### Send Comprehensive Update
```python
import requests

data = {
    "btc_price": 43750.25,
    "btc_change_24h": 2.47,
    "ai_sentiment": "Bullish",
    "sentiment_score": 72,
    "market_trend": "Uptrend",
    "trend_confidence": 85,
    "consensus_score": 78,
    "active_models": 5,
    "predictions": [
        {"model": "LSTM Neural Net", "value": "$44,200", "confidence": 82},
        {"model": "Random Forest", "value": "$43,950", "confidence": 76}
    ],
    "patterns": [
        {"name": "Bullish Engulfing", "detected": "2h ago", "confidence": "High"}
    ],
    "signals": [
        {"time": "14:23", "text": "Strong buy signal detected", "type": "bullish"}
    ]
}

response = requests.post(
    "http://localhost:5000/api/webhook",
    json=data
)
print(response.json())
```

## 🌐 GitHub Pages Deployment

The dashboard is automatically deployed to GitHub Pages on every push to the main branch.

### Setup GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. The workflow will automatically deploy on push

### Access Your Dashboard
Once deployed, visit: **https://grumpified-oggvct.github.io/Bitcoin_Overloard/**

## 🛠️ Development

### Dashboard Development
The dashboard uses vanilla JavaScript with Chart.js for visualization. No build step required.

- **HTML**: `index.html` (root)
- **CSS**: `static/css/dashboard.css`
- **JavaScript**: `static/js/dashboard.js`

### API Development
The webhook API is built with Flask.

```bash
# Install dependencies
cd api
pip install -r requirements.txt

# Run development server
python webhook_receiver.py

# Test endpoints
curl http://localhost:5000/api/health
```

### Demo Mode
The dashboard includes a demo mode with simulated data when the API is not available. This allows you to preview the dashboard without running the backend.

## 🔒 Security Considerations

- The webhook API should be secured with authentication in production
- Consider using environment variables for sensitive configuration
- Add rate limiting to prevent abuse
- Use HTTPS in production environments

## 📊 Dashboard Features

### Metrics Display
- Bitcoin price with 24h change
- AI sentiment analysis with visual bar
- Market trend with confidence score
- Model consensus percentage

### Charts
- Interactive price and prediction timeline
- Toggle between 24H, 7D, and 30D views
- Real-time updates (configurable interval)

### AI Predictions
- Multiple model predictions displayed
- Confidence scores for each model
- Real-time model updates

### Pattern Detection
- Automatic pattern recognition
- Confidence levels
- Detection timestamps

### Trading Signals
- Chronological signal list
- Signal types (bullish/bearish/neutral)
- Timestamps for each signal

### Reports
- List of generated reports
- One-click refresh
- Sortable by date

## 💰 Support

If Bitcoin Overloard helps you make smarter trading decisions, consider supporting development:

- **Ko-fi**: https://ko-fi.com/grumpified
- **Lightning Network**: gossamerfalling850577@getalby.com

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🔗 Links

- **Repository**: https://github.com/Grumpified-OGGVCT/Bitcoin_Overloard
- **Live Dashboard**: https://grumpified-oggvct.github.io/Bitcoin_Overloard/
- **Issues**: https://github.com/Grumpified-OGGVCT/Bitcoin_Overloard/issues

---

**Bitcoin Overloard** - Empowering traders with AI-driven intelligence 🚀
