'use client'

import { useState, useEffect, useRef } from 'react'
import { fetchLiveConflicts } from '@/lib/api'
import { Crosshair, AlertTriangle, GripHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ConflictTracker() {
  const [conflicts, setConflicts] = useState<any[]>([])

  useEffect(() => {
    const fetchIt = async () => {
      const data = await fetchLiveConflicts();
      setConflicts(data);
    };
    fetchIt();
    const intv = setInterval(fetchIt, 60000);
    return () => clearInterval(intv);
  }, []);

  const constraintsRef = useRef<HTMLDivElement>(null)

  if (conflicts.length === 0) return null;

  return (
    <>
      {/* Invisible constraint area for dragging */}
      <div ref={constraintsRef} className="fixed inset-0 z-0 pointer-events-none" />
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className="absolute z-50 bottom-6 left-6 w-80 flex flex-col gap-2 pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <div className="bg-[#0b1426]/90 backdrop-blur-md border border-[var(--status-critical)] p-4 rounded-lg shadow-[0_0_20px_rgba(255,59,92,0.2)]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[var(--status-critical)] animate-pulse" />
              <span className="text-[12px] font-display font-bold text-[var(--status-critical)] tracking-[0.1em]">ACTIVE HOTSPOTS</span>
            </div>
            <GripHorizontal className="w-4 h-4 text-[#4A7FA0] opacity-50" />
          </div>
        
        <div className="flex flex-col gap-4">
          {conflicts.map((c, i) => (
            <div key={i} className="flex flex-col gap-1.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-display text-white font-bold tracking-wide">{c.name}</span>
                <span className="text-[10px] font-mono text-[var(--status-critical)] border border-[var(--status-critical)] px-1.5 py-0.5 rounded capitalize bg-red-500/10">
                  {c.severity}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#4A7FA0] mt-0.5">
                ACTORS: {c.actors.join(' VS ')}
              </span>
              {c.recentEvents && c.recentEvents.length > 0 && (
                <div className="bg-[#0f1f38]/80 p-2 rounded mt-1.5 border border-[#1a3a55]">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#4DA3FF] shrink-0 mt-0.5" />
                    <span className="text-[11px] font-sans text-[#B0C4D8] line-clamp-2 leading-relaxed">
                      {c.recentEvents[0].title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  )
}
