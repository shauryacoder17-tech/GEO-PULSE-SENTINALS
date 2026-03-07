'use client'

import { useRef, useEffect, useState } from 'react'
import {
  Activity,
  Flame,
  CloudLightning,
  Crosshair,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { globalEvents, eventTypeConfig, severityConfig } from '@/lib/dashboard-data'
import type { GlobalEvent } from '@/lib/dashboard-data'

export default function EventTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 320
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  const eventIcons: Record<string, React.ReactNode> = {
    earthquake: <Activity className="w-3.5 h-3.5" />,
    wildfire: <Flame className="w-3.5 h-3.5" />,
    storm: <CloudLightning className="w-3.5 h-3.5" />,
    conflict: <Crosshair className="w-3.5 h-3.5" />,
    market: <TrendingUp className="w-3.5 h-3.5" />,
  }

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 1) return 'JUST NOW'
    if (diffHrs < 24) return `${diffHrs}H AGO`
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays}D AGO`
  }

  return (
    <div className="h-36 shrink-0 bg-sentinel-surface border-t border-border flex flex-col relative">
      {/* Timeline Header */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan animate-pulse-dot" />
          <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em]">LIVE EVENT FEED</span>
          <span className="text-[9px] font-mono text-muted-foreground ml-2">{globalEvents.length} EVENTS</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan disabled:opacity-30 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan disabled:opacity-30 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-stretch overflow-x-auto px-4 py-2 gap-3 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Connection line */}
        <div className="absolute bottom-[52px] left-4 right-4 h-px bg-border pointer-events-none z-0" />

        {globalEvents.map((event, i) => (
          <EventCard
            key={event.id}
            event={event}
            icon={eventIcons[event.type]}
            timeAgo={formatTimestamp(event.timestamp)}
            index={i}
          />
        ))}
      </div>

      {/* Scroll Fades */}
      {canScrollLeft && (
        <div className="absolute left-0 top-8 bottom-0 w-8 bg-gradient-to-r from-sentinel-surface to-transparent pointer-events-none z-10" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-8 bottom-0 w-8 bg-gradient-to-l from-sentinel-surface to-transparent pointer-events-none z-10" />
      )}
    </div>
  )
}

function EventCard({
  event,
  icon,
  timeAgo,
  index,
}: {
  event: GlobalEvent
  icon: React.ReactNode
  timeAgo: string
  index: number
}) {
  const typeConf = eventTypeConfig[event.type]
  const sevConf = severityConfig[event.severity]

  return (
    <div
      className="relative shrink-0 w-56 flex flex-col gap-1.5 p-2.5 rounded bg-sentinel-surface-2/60 border border-border hover:border-sentinel-cyan/30 transition-all duration-200 cursor-default group animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top row: type badge + severity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ color: typeConf?.color }}>{icon}</span>
          <span
            className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: typeConf?.color, background: `${typeConf?.color}15` }}
          >
            {typeConf?.label}
          </span>
        </div>
        <span
          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider"
          style={{ color: sevConf?.color, background: sevConf?.bg }}
        >
          {event.severity.toUpperCase()}
        </span>
      </div>

      {/* Title */}
      <p className="text-[11px] font-mono text-foreground leading-tight line-clamp-2 group-hover:text-sentinel-cyan transition-colors">
        {event.title}
      </p>

      {/* Bottom: location + time */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[9px] font-mono text-muted-foreground">{event.location}</span>
        <span className="text-[9px] font-mono text-muted-foreground/60">{timeAgo}</span>
      </div>

      {/* Glowing connector dot */}
      <div
        className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-10"
        style={{
          background: typeConf?.color,
          boxShadow: `0 0 6px ${typeConf?.color}`,
        }}
      />
    </div>
  )
}
