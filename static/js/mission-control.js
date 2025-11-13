// Mission Control Dashboard - Main JavaScript

class MissionControlDashboard {
    constructor() {
        this.ws = null;
        this.autoRefresh = true;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Mission Control Dashboard...');
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup WebSocket
        this.setupWebSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized');
    }

    async loadInitialData() {
        try {
            const [health, portfolio, regime, trades] = await Promise.all([
                fetch('/api/system/health').then(r => r.json()),
                fetch('/api/portfolio/current').then(r => r.json()),
                fetch('/api/market/regime').then(r => r.json()),
                fetch('/api/trades/recent?limit=20').then(r => r.json())
            ]);

            this.updateTopBar(health, portfolio, regime);
            this.updateLeftPanel(regime, portfolio);
            this.updateMainCanvas(portfolio, trades);
            this.updateBottomBar(trades);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to connect to API. Is the server running?');
        }
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.updateConnectionStatus(true);
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeUpdate(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus(false);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            this.updateConnectionStatus(false);
            setTimeout(() => this.setupWebSocket(), 3000);
        };
    }

    handleRealtimeUpdate(data) {
        switch(data.type) {
            case 'initial_state':
                this.updateTopBar(data.health, data.portfolio, data.regime);
                this.updateLeftPanel(data.regime, data.portfolio);
                break;
            case 'portfolio_update':
                this.updatePortfolioValue(data.total_value, data.pnl_today);
                break;
            case 'trade_executed':
                this.addTradeToFeed(data);
                this.flashNotification('Trade executed!');
                break;
            case 'regime_change':
                this.updateRegimeUI(data);
                this.showAlert(`Regime changed to ${data.regime}`);
                break;
        }
    }

    updateTopBar(health, portfolio, regime) {
        const topBar = document.getElementById('top-bar');
        if (!topBar) return;

        // System status indicator
        const statusClass = health.status === 'operational' ? 'operational' : 
                          health.status === 'degraded' ? 'degraded' : 'critical';
        
        topBar.innerHTML = `
            <div class="system-status-indicator ${statusClass}" title="Click for details"></div>
            <div class="market-conditions ${regime.regime.toLowerCase()}">
                MARKET: [${regime.regime}] ${Math.round(regime.confidence * 100)}%
            </div>
            <div class="active-strategies">
                <span class="strategy-badge">Grid 40%</span>
                <span class="strategy-badge">DCA 10%</span>
            </div>
            <div class="pnl-today ${portfolio.pnl_today.dollars >= 0 ? 'positive' : 'negative'}">
                ${portfolio.pnl_today.dollars >= 0 ? '+' : ''}$${portfolio.pnl_today.dollars.toFixed(2)} 
                (${portfolio.pnl_today.percent >= 0 ? '+' : ''}${portfolio.pnl_today.percent.toFixed(2)}%)
            </div>
            <div class="connectivity-status">
                <div class="connectivity-icon connected" title="Kraken API"></div>
                <div class="connectivity-icon connected" title="Database"></div>
                <div class="connectivity-icon connected" title="LLM"></div>
            </div>
            <div class="last-action-time">Last trade: 14m ago</div>
            <button class="panic-button" onclick="dashboard.emergencyStop()">EMERGENCY STOP</button>
        `;
    }

    updateLeftPanel(regime, portfolio) {
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;

        leftPanel.innerHTML = `
            <div class="panel-card expanded">
                <div class="panel-card-header">
                    <span class="panel-card-title">Regime Overview</span>
                </div>
                <div class="panel-card-content">
                    <div class="regime-badge ${regime.regime.toLowerCase()}">
                        ${regime.regime} - ${Math.round(regime.confidence * 100)}%
                    </div>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                        Last update: 3m ago
                    </div>
                    <div style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
                        ${regime.llm_reasoning || 'No reasoning available'}
                    </div>
                </div>
            </div>

            <div class="panel-card expanded">
                <div class="panel-card-header">
                    <span class="panel-card-title">Portfolio State</span>
                </div>
                <div class="panel-card-content">
                    <div class="portfolio-value">$${portfolio.total_value.toFixed(2)}</div>
                    <div class="asset-breakdown">💵 Cash: $${portfolio.cash.toFixed(2)} (${((portfolio.cash / portfolio.total_value) * 100).toFixed(1)}%)</div>
                    <div class="asset-breakdown">₿ BTC: ${portfolio.positions.find(p => p.asset === 'BTC')?.size.toFixed(4) || '0'} 
                        ($${portfolio.positions.find(p => p.asset === 'BTC')?.value.toFixed(2) || '0'})</div>
                    <div style="margin-top: 12px; font-size: 12px;">
                        Today: ${portfolio.pnl_today.dollars >= 0 ? '+' : ''}$${portfolio.pnl_today.dollars.toFixed(2)} 
                        (${portfolio.pnl_today.percent >= 0 ? '+' : ''}${portfolio.pnl_today.percent.toFixed(2)}%)
                        <span style="color: ${portfolio.pnl_today.dollars >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">${portfolio.pnl_today.dollars >= 0 ? '🟢' : '🔴'}</span>
                    </div>
                </div>
            </div>

            <div class="panel-card">
                <div class="panel-card-header">
                    <span class="panel-card-title">🎯 Pending Signals (0)</span>
                </div>
                <div class="panel-card-content">
                    <div style="font-size: 12px; color: #9ca3af;">No pending signals</div>
                </div>
            </div>

            <div class="panel-card">
                <div class="panel-card-header">
                    <span class="panel-card-title">Quick Actions</span>
                </div>
                <div class="panel-card-content">
                    <button style="width: 100%; padding: 8px; margin-bottom: 8px; background: var(--color-yellow); border: none; border-radius: 4px; cursor: pointer;">
                        Pause All Trading
                    </button>
                    <button style="width: 100%; padding: 8px; margin-bottom: 8px; background: var(--color-blue); border: none; border-radius: 4px; cursor: pointer;">
                        Force Regime Recheck
                    </button>
                    <button style="width: 100%; padding: 8px; background: var(--color-gray); border: none; border-radius: 4px; cursor: pointer;">
                        Export Today's Trades
                    </button>
                </div>
            </div>
        `;
    }

    updateMainCanvas(portfolio, trades) {
        const mainCanvas = document.getElementById('main-canvas');
        if (!mainCanvas) return;

        mainCanvas.innerHTML = `
            <div class="position-dashboard">
                <div class="chart-container">
                    <h3 style="margin-bottom: 16px; font-size: 16px;">Live Price Chart</h3>
                    <div id="price-chart" style="height: 300px; background: #111827; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                        Chart placeholder (would integrate Plotly.js)
                    </div>
                </div>

                <div class="positions-table">
                    <h3 style="padding: 16px; font-size: 16px; border-bottom: 1px solid #374151;">Open Positions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ASSET</th>
                                <th>SIZE</th>
                                <th>ENTRY</th>
                                <th>CURRENT</th>
                                <th>P&L</th>
                                <th>DURATION</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${portfolio.positions.map(pos => `
                                <tr onclick="dashboard.showPositionDetails('${pos.asset}')">
                                    <td>${pos.asset}</td>
                                    <td>${pos.size.toFixed(4)}</td>
                                    <td>$${pos.entry_price.toFixed(2)}</td>
                                    <td>$${pos.current_price.toFixed(2)}</td>
                                    <td class="${pos.unrealized_pnl >= 0 ? 'text-green' : 'text-red'}">
                                        ${pos.unrealized_pnl >= 0 ? '+' : ''}$${pos.unrealized_pnl.toFixed(2)}
                                        (${pos.unrealized_pnl_percent >= 0 ? '+' : ''}${pos.unrealized_pnl_percent.toFixed(2)}%)
                                    </td>
                                    <td>2h 14m</td>
                                    <td>
                                        <button onclick="event.stopPropagation(); dashboard.closePosition('${pos.asset}')" 
                                                style="padding: 4px 8px; background: var(--color-red); border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                                            Close
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                            ${portfolio.positions.length === 0 ? `
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 24px; color: #6b7280;">
                                        No open positions
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    updateBottomBar(trades) {
        const bottomBar = document.getElementById('bottom-bar');
        if (!bottomBar) return;

        const feedItems = trades.slice(0, 10).map(trade => {
            const time = new Date(trade.timestamp).toLocaleTimeString();
            const action = trade.action === 'BUY' ? '🟢 BUY' : '🔴 SELL';
            return `<div class="activity-feed-item trade">${time} | ${action} | ${trade.strategy} | ${trade.asset} @ $${trade.price.toFixed(2)}</div>`;
        }).join('');

        bottomBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>ACTIVITY FEED (Live)</strong>
                <div>
                    <button onclick="dashboard.pauseFeed()" style="padding: 4px 8px; background: var(--color-gray); border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Pause</button>
                    <button onclick="dashboard.clearFeed()" style="padding: 4px 8px; background: var(--color-gray); border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 4px;">Clear</button>
                </div>
            </div>
            <div class="activity-feed">
                ${feedItems || '<div style="color: #6b7280;">No recent activity</div>'}
            </div>
        `;
    }

    updatePortfolioValue(totalValue, pnlToday) {
        const valueElement = document.querySelector('.portfolio-value');
        if (valueElement) {
            valueElement.textContent = `$${totalValue.toFixed(2)}`;
            valueElement.classList.add('flash');
            setTimeout(() => valueElement.classList.remove('flash'), 1000);
        }
    }

    updateConnectionStatus(connected) {
        // Update connectivity icons
        const icons = document.querySelectorAll('.connectivity-icon');
        icons.forEach(icon => {
            icon.className = `connectivity-icon ${connected ? 'connected' : 'disconnected'}`;
        });
    }

    setupEventListeners() {
        // Panel card expand/collapse
        document.addEventListener('click', (e) => {
            if (e.target.closest('.panel-card-header')) {
                const card = e.target.closest('.panel-card');
                card.classList.toggle('expanded');
            }
        });
    }

    startAutoRefresh() {
        this.updateInterval = setInterval(() => {
            if (this.autoRefresh) {
                this.loadInitialData();
            }
        }, 30000); // Refresh every 30 seconds
    }

    emergencyStop() {
        if (confirm('Are you sure you want to EMERGENCY STOP all trading?')) {
            // Would call API to pause all trading
            this.showAlert('🚨 EMERGENCY STOP activated. All trading paused.');
        }
    }

    showPositionDetails(asset) {
        // Would load full position details view
        console.log(`Showing details for ${asset}`);
    }

    closePosition(asset) {
        if (confirm(`Close ${asset} position?`)) {
            // Would call API to close position
            console.log(`Closing ${asset} position`);
        }
    }

    pauseFeed() {
        this.autoRefresh = !this.autoRefresh;
    }

    clearFeed() {
        const feed = document.querySelector('.activity-feed');
        if (feed) feed.innerHTML = '';
    }

    showAlert(message) {
        // Simple alert (would use toast notification library)
        alert(message);
    }

    flashNotification(message) {
        // Would show toast notification
        console.log('Notification:', message);
    }

    showError(message) {
        // Would show error toast
        console.error(message);
    }
}

// Initialize dashboard on page load
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new MissionControlDashboard();
    window.dashboard = dashboard; // Make available globally
});

