import { useState, useEffect, useCallback } from 'react';
import './App.css';

interface WhaleBuy {
  id: string;
  amount: number;
  tonAmount: number;
  wallet: string;
  timestamp: Date;
  isNew: boolean;
}

const generateWallet = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let wallet = 'EQ';
  for (let i = 0; i < 46; i++) {
    wallet += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return wallet;
};

const generateBuy = (): WhaleBuy => {
  const amounts = [2500, 3000, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 100000, 150000, 250000];
  const weightedAmounts = [...amounts.slice(0, 6), ...amounts.slice(0, 6), ...amounts.slice(0, 4), ...amounts.slice(6)];
  const amount = weightedAmounts[Math.floor(Math.random() * weightedAmounts.length)] + Math.floor(Math.random() * 500);
  const tonPrice = 3.42 + (Math.random() * 0.2 - 0.1);

  return {
    id: Math.random().toString(36).substr(2, 9),
    amount,
    tonAmount: Math.round(amount / tonPrice),
    wallet: generateWallet(),
    timestamp: new Date(),
    isNew: true,
  };
};

const initialBuys: WhaleBuy[] = Array.from({ length: 15 }, () => {
  const buy = generateBuy();
  buy.timestamp = new Date(Date.now() - Math.random() * 3600000);
  buy.isNew = false;
  return buy;
}).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

function App() {
  const [buys, setBuys] = useState<WhaleBuy[]>(initialBuys);
  const [totalVolume, setTotalVolume] = useState(() => initialBuys.reduce((sum, b) => sum + b.amount, 0));
  const [pulseActive, setPulseActive] = useState(false);
  const [radarAngle, setRadarAngle] = useState(0);

  const addNewBuy = useCallback(() => {
    const newBuy = generateBuy();
    setBuys(prev => {
      const updated = [newBuy, ...prev.slice(0, 49)];
      return updated;
    });
    setTotalVolume(prev => prev + newBuy.amount);
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 1000);

    setTimeout(() => {
      setBuys(prev => prev.map(b => b.id === newBuy.id ? { ...b, isNew: false } : b));
    }, 3000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        addNewBuy();
      }
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [addNewBuy]);

  useEffect(() => {
    const radarInterval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(radarInterval);
  }, []);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000) return `$${(amount / 1000).toFixed(0)}K`;
    if (amount >= 10000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getAmountTier = (amount: number): string => {
    if (amount >= 100000) return 'tier-legendary';
    if (amount >= 50000) return 'tier-epic';
    if (amount >= 25000) return 'tier-rare';
    if (amount >= 10000) return 'tier-uncommon';
    return 'tier-common';
  };

  return (
    <div className="app">
      <div className="scanlines" />
      <div className="grid-bg" />

      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className={`radar ${pulseActive ? 'pulse' : ''}`}>
              <div className="radar-sweep" style={{ transform: `rotate(${radarAngle}deg)` }} />
              <div className="radar-center" />
            </div>
            <div className="logo-text">
              <span className="logo-main">$CLONK</span>
              <span className="logo-sub">WHALE TRACKER</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">LIVE MONITORING</span>
          </div>
        </div>

        <div className="header-right">
          <div className="stat-box">
            <span className="stat-label">24H VOLUME</span>
            <span className="stat-value">${(totalVolume / 1000000).toFixed(2)}M</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">THRESHOLD</span>
            <span className="stat-value highlight">$2,500+</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="table-container">
          <div className="table-header">
            <div className="col col-time">TIME</div>
            <div className="col col-wallet">WALLET</div>
            <div className="col col-ton">TON</div>
            <div className="col col-usd">USD</div>
            <div className="col col-action">ACTION</div>
          </div>

          <div className="table-body">
            {buys.map((buy, index) => (
              <div
                key={buy.id}
                className={`table-row ${buy.isNew ? 'new-entry' : ''} ${getAmountTier(buy.amount)}`}
                style={{ animationDelay: buy.isNew ? '0ms' : `${index * 30}ms` }}
              >
                <div className="col col-time">
                  <span className="time-value">{formatTime(buy.timestamp)}</span>
                </div>
                <div className="col col-wallet">
                  <span className="wallet-badge">
                    <span className="wallet-icon">◆</span>
                    {formatWallet(buy.wallet)}
                  </span>
                </div>
                <div className="col col-ton">
                  <span className="ton-amount">{buy.tonAmount.toLocaleString()}</span>
                  <span className="ton-label">TON</span>
                </div>
                <div className="col col-usd">
                  <span className={`usd-amount ${getAmountTier(buy.amount)}`}>
                    {formatAmount(buy.amount)}
                  </span>
                </div>
                <div className="col col-action">
                  <span className="action-tag">BUY</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="side-panel">
          <div className="panel-section">
            <h3 className="panel-title">TIER LEGEND</h3>
            <div className="tier-list">
              <div className="tier-item tier-legendary">
                <span className="tier-dot" />
                <span className="tier-name">LEGENDARY</span>
                <span className="tier-range">$100K+</span>
              </div>
              <div className="tier-item tier-epic">
                <span className="tier-dot" />
                <span className="tier-name">EPIC</span>
                <span className="tier-range">$50K+</span>
              </div>
              <div className="tier-item tier-rare">
                <span className="tier-dot" />
                <span className="tier-name">RARE</span>
                <span className="tier-range">$25K+</span>
              </div>
              <div className="tier-item tier-uncommon">
                <span className="tier-dot" />
                <span className="tier-name">UNCOMMON</span>
                <span className="tier-range">$10K+</span>
              </div>
              <div className="tier-item tier-common">
                <span className="tier-dot" />
                <span className="tier-name">COMMON</span>
                <span className="tier-range">$2.5K+</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3 className="panel-title">NETWORK STATUS</h3>
            <div className="network-stats">
              <div className="net-stat">
                <span className="net-label">BLOCK HEIGHT</span>
                <span className="net-value">{(41892345 + Math.floor(Date.now() / 5000)).toLocaleString()}</span>
              </div>
              <div className="net-stat">
                <span className="net-label">AVG BLOCK TIME</span>
                <span className="net-value">5.0s</span>
              </div>
              <div className="net-stat">
                <span className="net-label">TON PRICE</span>
                <span className="net-value">$3.42</span>
              </div>
            </div>
          </div>

          <div className="panel-section chain-badge">
            <div className="chain-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="chain-name">TON NETWORK</span>
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>Requested by @hey_gamble · Built by @clonkbot</span>
      </footer>
    </div>
  );
}

export default App;
