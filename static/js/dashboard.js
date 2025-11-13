// Bitcoin Overloard Dashboard - Real-time Intelligence Updates
class BitcoinDashboard {
    constructor() {
        this.apiEndpoint = '/api/data';
        this.updateInterval = 10000; // 10 seconds
        this.chart = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initPriceChart();
        this.startAutoUpdate();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Chart range buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartRange(e.target.dataset.range);
            });
        });

        // Refresh reports button
        document.getElementById('refresh-reports')?.addEventListener('click', () => {
            this.loadReports();
        });
    }

    initPriceChart() {
        const ctx = document.getElementById('price-chart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Bitcoin Price',
                        data: [],
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        borderWidth: 2
                    },
                    {
                        label: 'AI Prediction',
                        data: [],
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a8a8a8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a8a8a8',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    async loadInitialData() {
        // Try to load from API, fall back to demo data
        try {
            await this.fetchData();
        } catch (error) {
            console.log('API not available, loading demo data');
            this.loadDemoData();
        }
    }

    async fetchData() {
        try {
            const response = await fetch(this.apiEndpoint);
            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            this.updateDashboard(data);
            this.setConnectionStatus(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            this.setConnectionStatus(false);
            throw error;
        }
    }

    loadDemoData() {
        // Demo data for demonstration purposes
        const demoData = {
            btc_price: 43750.25,
            btc_change_24h: 2.47,
            ai_sentiment: 'Bullish',
            sentiment_score: 72,
            market_trend: 'Uptrend',
            trend_confidence: 85,
            consensus_score: 78,
            active_models: 5,
            predictions: [
                { model: 'LSTM Neural Net', value: '$44,200', confidence: 82 },
                { model: 'Random Forest', value: '$43,950', confidence: 76 },
                { model: 'XGBoost', value: '$44,100', confidence: 79 },
                { model: 'ARIMA', value: '$43,800', confidence: 71 },
                { model: 'Transformer', value: '$44,350', confidence: 84 }
            ],
            patterns: [
                { name: 'Bullish Engulfing', detected: '2h ago', confidence: 'High' },
                { name: 'Golden Cross Forming', detected: '4h ago', confidence: 'Medium' },
                { name: 'Volume Spike', detected: '1h ago', confidence: 'High' }
            ],
            signals: [
                { time: '14:23', text: 'Strong buy signal detected', type: 'bullish' },
                { time: '13:45', text: 'Market volatility increasing', type: 'neutral' },
                { time: '12:10', text: 'Resistance at $44,000 broken', type: 'bullish' },
                { time: '11:30', text: 'Trading volume above average', type: 'bullish' }
            ],
            reports: [
                { name: 'Daily Market Analysis', date: '2025-11-13', time: '08:00' },
                { name: 'Weekly Prediction Report', date: '2025-11-11', time: '09:00' },
                { name: 'Risk Assessment', date: '2025-11-10', time: '15:30' }
            ],
            chart_data: this.generateChartData()
        };

        this.updateDashboard(demoData);
        this.setConnectionStatus(false);
    }

    generateChartData() {
        const labels = [];
        const prices = [];
        const predictions = [];
        const now = new Date();
        const basePrice = 43500;

        // Generate 24 hours of data
        for (let i = 24; i >= 0; i--) {
            const time = new Date(now - i * 3600000);
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            
            // Simulate price with some randomness
            const variance = (Math.random() - 0.5) * 1000;
            const trend = (24 - i) * 10;
            prices.push(basePrice + trend + variance);
            
            // Predictions slightly ahead
            if (i <= 12) {
                predictions.push(basePrice + trend + variance + 100);
            } else {
                predictions.push(null);
            }
        }

        return { labels, prices, predictions };
    }

    updateDashboard(data) {
        // Update price and change
        if (data.btc_price) {
            document.getElementById('btc-price').textContent = 
                `$${data.btc_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }

        if (data.btc_change_24h !== undefined) {
            const changeElement = document.querySelector('.change-value');
            const change = data.btc_change_24h;
            changeElement.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeElement.className = `change-value ${change >= 0 ? 'positive' : 'negative'}`;
        }

        // Update AI sentiment
        if (data.ai_sentiment) {
            document.getElementById('ai-sentiment').textContent = data.ai_sentiment;
        }

        if (data.sentiment_score !== undefined) {
            const fillElement = document.getElementById('sentiment-fill');
            fillElement.style.width = `${data.sentiment_score}%`;
            
            // Color based on score
            if (data.sentiment_score >= 70) {
                fillElement.style.background = '#2ecc71';
            } else if (data.sentiment_score >= 40) {
                fillElement.style.background = '#f39c12';
            } else {
                fillElement.style.background = '#e74c3c';
            }
        }

        // Update market trend
        if (data.market_trend) {
            document.getElementById('market-trend').textContent = data.market_trend;
        }

        if (data.trend_confidence !== undefined) {
            document.getElementById('trend-confidence').textContent = 
                `Confidence: ${data.trend_confidence}%`;
        }

        // Update consensus
        if (data.consensus_score !== undefined) {
            document.getElementById('consensus-score').textContent = `${data.consensus_score}%`;
        }

        if (data.active_models !== undefined) {
            document.getElementById('active-models').textContent = 
                `${data.active_models} models active`;
        }

        // Update predictions
        if (data.predictions) {
            this.updatePredictions(data.predictions);
        }

        // Update patterns
        if (data.patterns) {
            this.updatePatterns(data.patterns);
        }

        // Update signals
        if (data.signals) {
            this.updateSignals(data.signals);
        }

        // Update reports
        if (data.reports) {
            this.updateReports(data.reports);
        }

        // Update chart
        if (data.chart_data) {
            this.updateChart(data.chart_data);
        }

        // Update last update time
        this.updateLastUpdateTime();
    }

    updatePredictions(predictions) {
        const container = document.getElementById('predictions-list');
        container.innerHTML = '';

        predictions.forEach(pred => {
            const item = document.createElement('div');
            item.className = 'prediction-item';
            item.innerHTML = `
                <span class="model-name">${pred.model}</span>
                <span class="prediction-value">${pred.value}</span>
            `;
            container.appendChild(item);
        });
    }

    updatePatterns(patterns) {
        const container = document.getElementById('patterns-list');
        container.innerHTML = '';

        patterns.forEach(pattern => {
            const item = document.createElement('div');
            item.className = 'pattern-item';
            item.innerHTML = `
                <div><strong>${pattern.name}</strong></div>
                <div style="color: #a8a8a8; font-size: 12px; margin-top: 4px;">
                    Detected: ${pattern.detected} | Confidence: ${pattern.confidence}
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateSignals(signals) {
        const container = document.getElementById('signals-list');
        container.innerHTML = '';

        signals.forEach(signal => {
            const item = document.createElement('div');
            item.className = 'signal-item';
            item.innerHTML = `
                <span class="signal-time">${signal.time}</span>
                <span class="signal-text">${signal.text}</span>
            `;
            container.appendChild(item);
        });
    }

    updateReports(reports) {
        const container = document.getElementById('reports-list');
        container.innerHTML = '';

        reports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'report-item';
            item.innerHTML = `
                <span class="report-name">${report.name}</span>
                <span class="report-date">${report.date} ${report.time}</span>
            `;
            container.appendChild(item);
        });
    }

    updateChart(chartData) {
        if (!this.chart) return;

        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.prices;
        this.chart.data.datasets[1].data = chartData.predictions;
        this.chart.update('none'); // Update without animation for smooth real-time updates
    }

    updateChartRange(range) {
        // This would filter the chart data based on the selected range
        console.log('Chart range changed to:', range);
        // In a real implementation, fetch new data for the selected range
    }

    loadReports() {
        console.log('Refreshing reports...');
        // In a real implementation, fetch fresh reports from the API
        this.fetchData();
    }

    setConnectionStatus(connected) {
        this.isConnected = connected;
        const statusElement = document.getElementById('connection-status');
        
        if (connected) {
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connected';
            statusElement.className = 'status-indicator connected';
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Demo Mode';
            statusElement.className = 'status-indicator disconnected';
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('last-update').textContent = `Last Update: ${timeString}`;
    }

    startAutoUpdate() {
        setInterval(() => {
            this.fetchData().catch(() => {
                // If fetch fails, keep showing demo data
                this.loadDemoData();
            });
        }, this.updateInterval);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BitcoinDashboard();
});
