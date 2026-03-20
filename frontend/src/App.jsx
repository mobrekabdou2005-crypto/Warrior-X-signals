import React, { useEffect, useState } from 'react';
import { createClient } from '@insforge/sdk';
import { Activity, ArrowUpRight, ArrowDownRight, BarChart3, Clock, LineChart, ShieldCheck } from 'lucide-react';

// Setup InsForge client
const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || '';
const insforgeKey = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

let client = null;
if (insforgeUrl && insforgeKey) {
  client = createClient({ baseUrl: insforgeUrl, anonKey: insforgeKey });
}

function App() {
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState({ total: 0, winRate: 0, activePairs: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchSignals();
    
    // Subscribe to real-time changes if client is available
    if (client) {
      const subscription = client.channel('signals')
        .on('database', { event: 'INSERT', schema: 'public', table: 'signals' }, (payload) => {
           setSignals(prev => [payload.new, ...prev].slice(0, 50));
           updateStats([payload.new, ...signals]); // naive stat update
        })
        .subscribe();
        
      return () => { client.removeChannel(subscription); };
    }
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    if (!client) {
      // Mock data if no client
      const mock = [
        { id: 1, symbol: 'XAUUSD', signal_type: 'BUY', price: 2030.45, timestamp: new Date().toISOString() },
        { id: 2, symbol: 'EURUSD', signal_type: 'SELL', price: 1.0845, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, symbol: 'BTCUSDT', signal_type: 'BUY', price: 64200.00, timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, symbol: 'GBPUSD', signal_type: 'SELL', price: 1.2530, timestamp: new Date(Date.now() - 14400000).toISOString() }
      ];
      setSignals(mock);
      updateStats(mock);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client.db('signals')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setSignals(data);
        updateStats(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStats = (data) => {
    const total = data.length;
    const pairs = new Set(data.map(d => d.symbol)).size;
    // Mock win rate calculation
    const winRate = total > 0 ? 68.5 : 0; 
    setStats({ total, activePairs: pairs, winRate });
  };

  const filteredSignals = filter === 'ALL' ? signals : signals.filter(s => s.signal_type === filter);

  return (
    <div className="min-h-screen p-6 font-inter flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-6xl mb-10 flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Warrior X signals
            </h1>
            <p className="text-sm text-slate-400 font-medium tracking-wide">Automated Webhook Integration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${client ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
          <span className="text-sm font-medium text-slate-300">
            {client ? 'Connected to InsForge' : 'Demo Mode'}
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={<LineChart className="text-emerald-400" />} trend="+2.4%" />
        <StatCard title="Total Signals" value={stats.total} icon={<BarChart3 className="text-blue-400" />} trend="+12 this week" />
        <StatCard title="Active Pairs" value={stats.activePairs} icon={<ShieldCheck className="text-purple-400" />} trend="Stable" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl glass-panel rounded-2xl p-6 relative overflow-hidden">
        {/* Glow effect behind */}
        <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Recent Signals</h2>
            <p className="text-sm text-slate-400">Live feed from TradingView webhooks</p>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
            {['ALL', 'BUY', 'SELL'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${filter === f ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-slate-700/50">
                <th className="pb-3 pl-4 font-semibold">Pair</th>
                <th className="pb-3 font-semibold">Signal</th>
                <th className="pb-3 font-semibold">Entry Price</th>
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 pr-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Loading signals...</td></tr>
              ) : filteredSignals.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">No signals found.</td></tr>
              ) : (
                filteredSignals.map((signal, idx) => (
                  <tr key={signal.id || idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors animate-fade-in" style={{animationDelay: `${idx * 0.05}s`}}>
                    <td className="py-4 pl-4 font-bold text-white">{signal.symbol}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${signal.signal_type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {signal.signal_type === 'BUY' ? <ArrowUpRight w={14} h={14} /> : <ArrowDownRight w={14} h={14} />}
                        {signal.signal_type}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-300">{signal.price}</td>
                    <td className="py-4 text-slate-400 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> 
                       {new Date(signal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 group-hover:bg-slate-800 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

export default App;
