'use client'

import { useMemo } from 'react'
import {
  X,
  Thermometer,
  Droplets,
  Wind,
  Flame,
  Crosshair,
  Plane,
  Satellite,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CloudLightning,
  MapPin,
  Users,
frontend
  Download,
  Activity,

 main
} from 'lucide-react'
import type { Country } from '@/lib/dashboard-data'
import { riskLevelConfig } from '@/lib/dashboard-data'

interface CountryPanelProps {
  country: Country | null
  onClose: () => void
}

export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  if (!country) {
    return (
      <aside className="w-72 shrink-0 bg-sentinel-surface border-l border-border flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
            <MapPin className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <span className="text-xs font-mono text-muted-foreground tracking-wider">SELECT A COUNTRY</span>
          <span className="text-[10px] font-mono text-muted-foreground/60 max-w-[180px]">
            Click on any marker on the map to view intelligence data
          </span>
        </div>
      </aside>
    )
  }

  const riskConfig = riskLevelConfig[country.riskLevel]

  return (
    <aside className="w-72 shrink-0 bg-sentinel-surface border-l border-border flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border shrink-0">
 frontend
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" />
          <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em]">INTEL REPORT</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan bg-transparent hover:bg-sentinel-surface-2 rounded transition-all"
            aria-label="Export report"
            title="Export Intel Data"
            onClick={() => console.log('Exporting data...')}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-border mx-1" />
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-red bg-transparent hover:bg-sentinel-red/10 rounded transition-all"
            aria-label="Close panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em]">INTEL REPORT</span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan transition-colors"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Country Header */}
        <div className="p-4 border-b border-border animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-wide">{country.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-muted-foreground">{country.code}</span>
                <span className="text-[10px] font-mono text-muted-foreground">|</span>
                <span className="text-[10px] font-mono text-muted-foreground">{country.region}</span>
              </div>
            </div>
          </div>

          {/* Risk Meter */}
          <RiskMeter score={country.riskScore} level={country.riskLevel} config={riskConfig} />
        </div>

        {/* Data Sections */}
        <div className="flex flex-col">
          {/* Weather */}
          <DataSection title="WEATHER CONDITIONS" icon={<CloudLightning className="w-3 h-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <DataTile
                icon={<Thermometer className="w-3 h-3 text-sentinel-amber" />}
                label="TEMP"
                value={`${country.weather.temp}°C`}
              />
              <DataTile
                icon={<Droplets className="w-3 h-3 text-sentinel-cyan" />}
                label="HUMIDITY"
                value={`${country.weather.humidity}%`}
              />
              <DataTile
                icon={<Wind className="w-3 h-3 text-muted-foreground" />}
                label="WIND"
                value={`${country.weather.wind} km/h`}
              />
              <DataTile
                icon={<CloudLightning className="w-3 h-3 text-sentinel-cyan" />}
                label="STATUS"
                value={country.weather.condition}
                small
              />
            </div>
          </DataSection>

          {/* Disasters */}
          {country.disasters.length > 0 && (
            <DataSection title="RECENT DISASTERS" icon={<AlertTriangle className="w-3 h-3" />}>
              <div className="flex flex-col gap-1.5">
                {country.disasters.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-sentinel-surface-2/50 border border-border"
                  >
                    <AlertTriangle className="w-3 h-3 text-sentinel-amber shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-mono text-sentinel-amber">{d.type}</div>
                      <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">{d.description}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">{d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DataSection>
          )}

          {/* Conflict */}
          <DataSection title="CONFLICT STATUS" icon={<Crosshair className="w-3 h-3" />}>
            {country.conflictActive ? (
              <div className="p-2 rounded bg-sentinel-red/10 border border-sentinel-red/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sentinel-red animate-pulse-dot" />
                  <span className="text-[10px] font-mono text-sentinel-red font-semibold tracking-wider">ACTIVE CONFLICT</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  {country.conflictDescription}
                </p>
              </div>
            ) : (
              <div className="p-2 rounded bg-sentinel-green/10 border border-sentinel-green/20">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sentinel-green" />
                  <span className="text-[10px] font-mono text-sentinel-green tracking-wider">NO ACTIVE CONFLICT</span>
                </div>
              </div>
            )}
          </DataSection>

          {/* Indicators Grid */}
          <DataSection title="KEY INDICATORS" icon={<TrendingUp className="w-3 h-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <IndicatorCard
                icon={<TrendingUp className="w-3.5 h-3.5 text-sentinel-gold" />}
                label="GOLD"
                value={`$${country.goldIndicator}`}
                color="#FFD700"
              />
              <IndicatorCard
                icon={<Plane className="w-3.5 h-3.5 text-sentinel-cyan" />}
                label="FLIGHTS"
                value={country.flightDensity.toLocaleString()}
                color="#00E5FF"
              />
              <IndicatorCard
                icon={<Satellite className="w-3.5 h-3.5 text-sentinel-red" />}
                label="WILDFIRES"
                value={country.wildfireDetections.toString()}
                color="#FF3B3B"
              />
              <IndicatorCard
                icon={<Users className="w-3.5 h-3.5 text-sentinel-green" />}
                label="POPULATION"
                value={country.population}
                color="#00FF88"
              />
            </div>
          </DataSection>

          {/* Risk Trend Chart */}
          <DataSection title="RISK TREND (12M)" icon={<ShieldAlert className="w-3 h-3" />}>
            <RiskTrendChart data={country.marketData} color={riskConfig.color} />
          </DataSection>
        </div>
      </div>
    </aside>
  )
}

function RiskMeter({ score, level, config }: { score: number; level: string; config: { color: string; glow: string; label: string } }) {
  return (
    <div className="relative p-3 rounded bg-sentinel-surface-2/50 border border-border animate-glow-pulse"
      style={{ borderColor: `${config.color}30` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground tracking-wider">THREAT ASSESSMENT</span>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider"
          style={{ color: config.color, background: `${config.color}15` }}
        >
          {config.label}
        </span>
      </div>

      {/* Score Bar */}
      <div className="relative h-2 rounded-full bg-sentinel-surface-2 overflow-hidden mb-1.5">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
            boxShadow: config.glow,
          }}
        />
        {/* Marker lines */}
        <div className="absolute inset-0 flex">
          {[25, 50, 75].map(mark => (
            <div key={mark} className="absolute h-full w-px bg-sentinel-navy/80" style={{ left: `${mark}%` }} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground/60">0</span>
        <span className="text-lg font-mono font-bold" style={{ color: config.color, textShadow: config.glow }}>
          {score}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/60">100</span>
      </div>
    </div>
  )
}

function DataSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-3 border-b border-border animate-fade-in-up">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-sentinel-cyan">{icon}</span>
        <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.15em]">{title}</span>
      </div>
      {children}
    </div>
  )
}

function DataTile({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-sentinel-surface-2/50 border border-border">
      {icon}
      <div className="flex flex-col">
        <span className="text-[8px] font-mono text-muted-foreground/60">{label}</span>
        <span className={`font-mono text-foreground ${small ? 'text-[10px]' : 'text-xs'}`}>{value}</span>
      </div>
    </div>
  )
}

function IndicatorCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 rounded bg-sentinel-surface-2/50 border border-border text-center">
      {icon}
      <span className="text-[8px] font-mono text-muted-foreground/60 tracking-wider">{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  )
}

function RiskTrendChart({ data, color }: { data: number[]; color: string }) {
 frontend
  const { points, min, range, height, width } = useMemo(() => {
    const maxVal = Math.max(...data)
    const minVal = Math.min(...data)
    const rangeVal = maxVal - minVal || 1
    const h = 50
    const w = 200

    const pts = data.map((val, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((val - minVal) / rangeVal) * h
      return `${x},${y}`
    }).join(' ')

    return { points: pts, min: minVal, range: rangeVal, height: h, width: w }
  }, [data])

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 50
  const width = 200

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')
 main

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`trend-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1="0" y1={p * height} x2={width} y2={p * height} stroke="#1E293B" strokeWidth="0.5" />
        ))}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#trend-${color.replace('#', '')})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Last point dot */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * height}
            r="3"
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] font-mono text-muted-foreground/50">12M AGO</span>
        <span className="text-[8px] font-mono text-muted-foreground/50">NOW</span>
      </div>
    </div>
  )
}
