'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  X,
  Thermometer,
  Droplets,
  Wind,
  CloudLightning,
  MapPin,
  Users,
  Download,
  Activity,
  TrendingUp,
  Plane,
  Satellite,
  ShieldAlert,
  AlertTriangle,
  BrainCircuit,
  Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Country } from '@/lib/dashboard-data'
import { riskLevelConfig } from '@/lib/dashboard-data'

export default function CountryPanel({ country, onClose }: any) {
  if (!country) return <EmptyPanel />

  const riskConfig = riskLevelConfig[country.riskLevel]

  return (
    <motion.aside 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 288, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="w-72 shrink-0 bg-sentinel-surface border-l border-border flex flex-col overflow-hidden"
    >
      <div className="h-10 flex items-center justify-between px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" />
          <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em]">INTEL REPORT</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan bg-transparent hover:bg-sentinel-surface-2 rounded transition-all">
            <Download className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-border mx-1" />
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-red bg-transparent hover:bg-sentinel-red/10 rounded transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <motion.div layout className="p-4 border-b border-border">
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
          <RiskMeter score={country.riskScore} level={country.riskLevel} config={riskConfig} />
        </motion.div>

        <div className="flex flex-col">
          <AIAnalysisSection countryCode={country.code} />
          <DataSection title="WEATHER CONDITIONS" icon={<CloudLightning className="w-3 h-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <DataTile icon={<Thermometer className="w-3 h-3 text-sentinel-amber" />} label="TEMP" value={`${country.weather.temp}°C`} />
              <DataTile icon={<Droplets className="w-3 h-3 text-sentinel-cyan" />} label="HUMIDITY" value={`${country.weather.humidity}%`} />
              <DataTile icon={<Wind className="w-3 h-3 text-muted-foreground" />} label="WIND" value={`${country.weather.wind} km/h`} />
              <DataTile icon={<CloudLightning className="w-3 h-3 text-sentinel-cyan" />} label="STATUS" value={country.weather.condition} small />
            </div>
          </DataSection>
          
          <DataSection title="KEY INDICATORS" icon={<TrendingUp className="w-3 h-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <IndicatorCard icon={<TrendingUp className="w-3.5 h-3.5 text-sentinel-gold" />} label="GOLD" value={`$${country.goldIndicator}`} color="#FFD700" />
              <IndicatorCard icon={<Plane className="w-3.5 h-3.5 text-sentinel-cyan" />} label="FLIGHTS" value={country.flightDensity.toLocaleString()} color="#00E5FF" />
            </div>
          </DataSection>
        </div>
      </div>
    </motion.aside>
  )
}

function AIAnalysisSection({ countryCode }: { countryCode: string }) {
  const [analyzing, setAnalyzing] = useState(true)

  useEffect(() => {
    setAnalyzing(true)
    const t = setTimeout(() => setAnalyzing(false), 2000)
    return () => clearTimeout(t)
  }, [countryCode])

  return (
    <DataSection title="AI MARKET & THREAT ANALYZER" icon={<BrainCircuit className="w-3 h-3" />}>
      <div className="relative p-3 rounded bg-sentinel-surface-2/40 border border-sentinel-cyan/20 overflow-hidden">
        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <Cpu className="w-5 h-5 text-sentinel-cyan animate-pulse" />
            <span className="text-[10px] font-mono text-sentinel-cyan tracking-widest animate-pulse">PROCESSING NEURAL ANALYSIS...</span>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan mt-1 shrink-0 shadow-[0_0_8px_#00E5FF]" />
              <p className="text-[10px] font-mono text-foreground leading-relaxed">
                Market stability vector is nominal. High correlation between recent regional transit anomalies and localized volatility.
              </p>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-sentinel-cyan/10">
              <span className="text-[9px] font-mono text-muted-foreground">CONFIDENCE: 94.2%</span>
              <span className="text-[9px] font-mono text-sentinel-cyan">MODEL: GEO-SENTINEL-v2</span>
            </div>
          </motion.div>
        )}
      </div>
    </DataSection>
  )
}

function EmptyPanel() {
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

// Reuse other small components exactly
function RiskMeter({ score, level, config }: any) {
  return (
    <div className="relative p-3 rounded bg-sentinel-surface-2/50 border border-border" style={{ borderColor: `${config.color}30` }}>
      <div className="flex items-center justify-between mb-2">
         <span className="text-[10px] font-mono text-muted-foreground tracking-wider">THREAT</span>
         <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ color: config.color, background: `${config.color}15` }}>{config.label}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-sentinel-surface-2 overflow-hidden mb-1.5">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute inset-y-0 left-0 rounded-full" style={{ background: config.color, boxShadow: config.glow }} />
      </div>
    </div>
  )
}

function DataSection({ title, icon, children }: any) {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-sentinel-cyan">{icon}</span>
        <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.15em]">{title}</span>
      </div>
      {children}
    </div>
  )
}

function DataTile({ icon, label, value, small }: any) {
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

function IndicatorCard({ icon, label, value, color }: any) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 rounded bg-sentinel-surface-2/50 border border-border">
      {icon}
      <span className="text-[8px] font-mono text-muted-foreground/60 tracking-wider">{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  )
}
