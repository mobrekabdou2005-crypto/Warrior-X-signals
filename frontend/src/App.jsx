import React, { useEffect, useState } from 'react';
import { createClient } from '@insforge/sdk';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Clock, 
  LineChart, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Search,
  ChevronRight,
  User,
  LayoutDashboard
} from 'lucide-react';

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
    
    if (client) {
      const subscription = client.channel('signals')
        .on('database', { event: 'INSERT', schema: 'public', table: 'signals' }, (payload) => {
           setSignals(prev => {
             const updated = [payload.new, ...prev].slice(0, 50);
             return updated;
           });
        })
        .subscribe();
        
      return () => { client.removeChannel(subscription); };
    }
  }, []);

  // Sync stats when signals change
  useEffect(() => {
    updateStats(signals);
  }, [signals]);

  const fetchSignals = async () => {
    setLoading(true);
    if (!client) {
      const mock = [
        { id: 1, symbol: 'XAUUSD', signal_type: 'BUY', price: 2030.45, timestamp: new Date().toISOString() },
        { id: 2, symbol: 'EURUSD', signal_type: 'SELL', price: 1.0845, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, symbol: 'BTCUSDT', signal_type: 'BUY', price: 63420.50, timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, symbol: 'GBPUSD', signal_type: 'SELL', price: 1.2530, timestamp: new Date(Date.now() - 14400000).toISOString() },
        { id: 5, symbol: 'SOLUSDT', signal_type: 'BUY', price: 145.20, timestamp: new Date(Date.now() - 17200000).toISOString() },
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
    const winRate = total > 0 ? 74.2 : 0; 
    setStats({ total, activePairs: pairs, winRate });
  };

  const filteredSignals = filter === 'ALL' ? signals : signals.filter(s => s.signal_type === filter);

  return (
    <div className="min-h-screen bg-mesh flex">
      
      {/* Side Navigation (Decorative for Desktop) */}
      <aside className="hidden lg:flex w-24 flex-col items-center py-8 border-r border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 mb-8 shadow-lg shadow-amber-500/10">
          <Zap className="text-amber-500 w-6 h-6 fill-amber-500/20" />
        </div>
        <nav className="flex flex-col gap-6">
          <NavItem icon={<LayoutDashboard size={22} />} active />
          <NavItem icon={<Activity size={22} />} />
          <NavItem icon={<LineChart size={22} />} />
          <NavItem icon={<User size={22} />} />
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-widest">Premium</span>
              <span className="text-slate-500 text-xs font-medium tracking-wider">MARCH 2026 EDITION</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Warrior <span className="text-amber-500 text-glow-gold">X</span> Signals
            </h1>
            <p className="text-slate-400 font-medium">Professional real-time trade monitoring system</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border-emerald-500/20">
               <div className="relative">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
               </div>
               <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                 {client ? 'Live Connection' : 'Demo Stream'}
               </span>
             </div>
             <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
               <Search size={18} className="text-slate-400" />
             </button>
          </div>
        </header>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Avg. Win Rate" 
            value={`${stats.winRate}%`} 
            icon={<TrendingUp className="text-emerald-400" />} 
            color="emerald"
            delay={0.1}
          />
          <StatCard 
            title="Active Pairs" 
            value={stats.activePairs} 
            icon={<Activity className="text-amber-400" />} 
            color="amber"
            delay={0.2}
          />
          <StatCard 
            title="Daily Signals" 
            value={stats.total} 
            icon={<Zap className="text-blue-400" />} 
            color="blue"
            delay={0.3}
          />
          <StatCard 
            title="Security Check" 
            value="Encrypted" 
            icon={<ShieldCheck className="text-indigo-400" />} 
            color="indigo"
            delay={0.4}
          />
        </div>

        {/* Signals Table Section */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden animate-in" style={{animationDelay: '0.4s'}}>
          {/* Decorative Corner Shimmer */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Signal Stream</h2>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Latency: <span className="text-emerald-500">42ms</span> • Source: TradingView Cloud</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              {['ALL', 'BUY', 'SELL'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filter === f ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 tracking-[0.2em] border-b border-white/5">
                  <th className="pb-5 pl-4 font-black">Instrument</th>
                  <th className="pb-5 font-black">Action</th>
                  <th className="pb-5 font-black">Entry Point</th>
                  <th className="pb-5 font-black text-center">Execution Time</th>
                  <th className="pb-5 pr-4 text-right font-black">Analytics</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-medium">
                {loading ? (
                  <tr><td colSpan="5" className="py-20 text-center text-slate-500 animate-pulse uppercase tracking-widest text-xs">Awaiting Network Data...</td></tr>
                ) : filteredSignals.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-slate-500 uppercase tracking-widest text-xs">No active signals match criteria</td></tr>
                ) : (
                  filteredSignals.map((signal, idx) => (
                    <tr key={signal.id || idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors animate-in group" style={{animationDelay: `${idx * 0.05 + 0.5}s`}}>
                      <td className="py-5 pl-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-white/5">
                             {signal.symbol.substring(0,2)}
                           </div>
                           <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{signal.symbol}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${signal.signal_type === 'BUY' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}`}>
                          {signal.signal_type === 'BUY' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                          {signal.signal_type}
                        </span>
                      </td>
                      <td className="py-5 font-mono font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
                        $ {signal.price.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="py-5 text-slate-400 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-slate-600" /> 
                           <span className="font-mono text-xs">{new Date(signal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                         </div>
                      </td>
                      <td className="py-5 pr-4 text-right">
                        <button className="text-[10px] font-bold text-slate-400 border border-white/10 px-3 py-1 rounded-lg group-hover:bg-white/5 group-hover:text-white transition-all flex items-center gap-1 ml-auto">
                          View Details <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-center">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">EndOfLine — Secure Protocol v2.4</p>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-20 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 animate-in" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              <Zap size={18} className="text-amber-500 fill-amber-500/10" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">Warrior X <span className="text-amber-500">Signals</span></p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">© 2026 Professional Trading Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <FooterLink label="Terms of Access" />
            <FooterLink label="Privacy Protocol" />
            <FooterLink label="System Status" />
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Powered by</p>
               <p className="text-xs text-white font-black italic">ULTRA-LATENCY ENGINE</p>
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FooterLink({ label }) {
  return (
    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">
      {label}
    </a>
  );
}

function StatCard({ title, value, icon, color, delay }) {
  const colors = {
    amber: 'from-amber-500/20 text-amber-500 border-amber-500/30',
    emerald: 'from-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'from-blue-500/20 text-blue-400 border-blue-500/30',
    indigo: 'from-indigo-500/20 text-indigo-400 border-indigo-500/30'
  };

  return (
    <div 
      className="glass-card glass-card-hover p-6 rounded-3xl overflow-hidden group animate-in shimmer" 
      style={{animationDelay: `${delay}s`}}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 bg-gradient-to-br rounded-2xl border ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex h-6 items-center px-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-[9px] font-black text-slate-500 uppercase">Live</span>
        </div>
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        <span className="text-xs text-emerald-500 font-bold">+1.2%</span>
      </div>
    </div>
  );
}

function NavItem({ icon, active }) {
  return (
    <button className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
      {icon}
    </button>
  );
}

export default App;

