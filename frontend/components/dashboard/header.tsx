'use client'

import { useEffect, useState } from 'react'
import {
  Shield,
  Wifi,
  Satellite,
  Bell,
  Radio,
  Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchLiveMarket } from '@/lib/api'

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour12: false,
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const STATUS_INDICATORS = [
  { label: 'DATA FEED', icon: Wifi, status: 'active' },
  { label: 'SAT LINK', icon: Satellite, status: 'active' },
  { label: 'SIGINT', icon: Radio, status: 'active' },
] as const

export default function DashboardHeader() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    const loadMarket = async () => {
      const data = await fetchLiveMarket();
      if(data) setMarketData(data);
    };
    loadMarket();
    const marketInterval = setInterval(loadMarket, 60000); // 1m

    const updateTime = () => {
      const now = new Date()
      setTime(timeFormatter.format(now))
      setDate(dateFormatter.format(now))
    }
    updateTime()
    const timerInterval = setInterval(updateTime, 1000)
    
    return () => {
      clearInterval(timerInterval)
      clearInterval(marketInterval)
    }
  }, [])

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-sentinel-surface border-b border-border relative z-50">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8">
          <Shield className="w-6 h-6 text-primary" />
          <div className="absolute inset-0 rounded-full animate-pulse-dot" style={{ boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)' }} />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-sm font-bold tracking-[0.3em] text-primary font-[var(--font-orbitron)]">
            GEOPULSE SENTINEL
          </h1>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
            GLOBAL INTELLIGENCE MONITORING SYSTEM
          </span>
        </div>
      </div>

      {/* Center: Market Ticker & Status */}
      <div className="hidden md:flex items-center gap-6">
        {STATUS_INDICATORS.map(({ label, icon: Icon, status }) => (
          <StatusBadge key={label} icon={<Icon className="w-3 h-3" />} label={label} status={status as any} />
        ))}
        
        {/* Market Data */}
        <div className="flex items-center gap-4 ml-4 border-l border-border pl-4">
          <AnimatePresence mode="popLayout">
            {marketData ? (
               <>
                 <MarketTickerItem 
                   label="GOLD" 
                   price={marketData.goldPrice} 
                   change={marketData.goldChange} 
                   prefix="$" 
                 />
                 <MarketTickerItem 
                   label="S&P 500" 
                   price={marketData.stocks['S&P 500']?.price} 
                   change={marketData.stocks['S&P 500']?.change} 
                 />
               </>
            ) : (
               <div className="text-[10px] font-mono text-muted-foreground animate-pulse">CONNECTING MARKET FEED...</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Time + Alerts */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sentinel-red animate-pulse-dot" />
        </div>
        <div className="flex flex-col items-end leading-none min-w-[80px]">
          <span className="text-sm font-mono text-primary tracking-wider animate-data-flicker">
            {time}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
            {date} UTC
          </span>
        </div>
      </div>
    </header>
  )
}

function MarketTickerItem({ label, price, change, prefix = '' }: any) {
  if (price === undefined || price === null) return null;
  const isPositive = change > 0;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      layout
      className="flex flex-col"
    >
      <span className="text-[9px] font-mono text-muted-foreground tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        <motion.span 
          key={price}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono font-bold text-foreground"
        >
          {prefix}{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.span>
        <span className={`text-[10px] font-mono ${isPositive ? 'text-sentinel-green' : 'text-sentinel-red'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
    </motion.div>
  )
}

const STATUS_COLORS = {
  active: { bg: 'bg-sentinel-green', text: 'text-sentinel-green' },
  warning: { bg: 'bg-sentinel-amber', text: 'text-sentinel-amber' },
  offline: { bg: 'bg-sentinel-red', text: 'text-sentinel-red' },
} as const

function StatusBadge({ icon, label, status }: any) {
  const { bg, text } = STATUS_COLORS[status as keyof typeof STATUS_COLORS]

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bg}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${bg}`} />
      </span>
      <span className={text}>{icon}</span>
      <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{label}</span>
    </div>
  )
}
