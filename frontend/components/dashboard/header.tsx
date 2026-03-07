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

export default function DashboardHeader() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
      setDate(
        now.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
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

      {/* Center: Status Indicators */}
      <div className="hidden md:flex items-center gap-6">
        <StatusBadge icon={<Wifi className="w-3 h-3" />} label="DATA FEED" status="active" />
        <StatusBadge icon={<Satellite className="w-3 h-3" />} label="SAT LINK" status="active" />
        <StatusBadge icon={<Radio className="w-3 h-3" />} label="SIGINT" status="active" />
        <StatusBadge icon={<Activity className="w-3 h-3" />} label="ANALYTICS" status="active" />
      </div>

      {/* Right: Time + Alerts */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sentinel-red animate-pulse-dot" />
        </div>
        <div className="flex flex-col items-end leading-none">
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

function StatusBadge({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode
  label: string
  status: 'active' | 'warning' | 'offline'
}) {
  const colors = {
    active: 'text-sentinel-green',
    warning: 'text-sentinel-amber',
    offline: 'text-sentinel-red',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`relative flex h-1.5 w-1.5`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'active' ? 'bg-sentinel-green' : status === 'warning' ? 'bg-sentinel-amber' : 'bg-sentinel-red'}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === 'active' ? 'bg-sentinel-green' : status === 'warning' ? 'bg-sentinel-amber' : 'bg-sentinel-red'}`} />
      </span>
      <span className={`${colors[status]}`}>{icon}</span>
      <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{label}</span>
    </div>
  )
}
