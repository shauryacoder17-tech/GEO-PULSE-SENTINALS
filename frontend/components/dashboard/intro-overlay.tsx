'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function playMilitaryIntroSound() {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.7, t)
    masterGain.connect(ctx.destination)

    // --- REVERB CONVOLVER (simulated large hall) ---
    const convolver = ctx.createConvolver()
    const reverbLen = ctx.sampleRate * 3
    const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = reverbBuf.getChannelData(ch)
      for (let i = 0; i < reverbLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5)
      }
    }
    convolver.buffer = reverbBuf
    const reverbGain = ctx.createGain()
    reverbGain.gain.setValueAtTime(0.25, t)
    convolver.connect(reverbGain)
    reverbGain.connect(masterGain)

    // Helper: connect dry + wet (reverb)
    const dryWet = (node: AudioNode, gain: GainNode) => {
      node.connect(gain)
      gain.connect(masterGain)
      node.connect(convolver)
    }

    // ===== 1) MASSIVE CINEMATIC IMPACT (double-layered) =====
    // Sub layer
    const impactSub = ctx.createOscillator()
    const impactSubG = ctx.createGain()
    impactSub.type = 'sine'
    impactSub.frequency.setValueAtTime(45, t)
    impactSub.frequency.exponentialRampToValueAtTime(18, t + 3.0)
    impactSubG.gain.setValueAtTime(0.9, t)
    impactSubG.gain.setValueAtTime(0.9, t + 0.1)
    impactSubG.gain.exponentialRampToValueAtTime(0.001, t + 3.0)
    dryWet(impactSub, impactSubG)
    impactSub.start(t)
    impactSub.stop(t + 3.0)

    // Thud noise layer (impact transient)
    const thudBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const thudData = thudBuf.getChannelData(0)
    for (let i = 0; i < thudData.length; i++) {
      thudData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / thudData.length, 6)
    }
    const thudNode = ctx.createBufferSource()
    thudNode.buffer = thudBuf
    const thudFilter = ctx.createBiquadFilter()
    thudFilter.type = 'lowpass'
    thudFilter.frequency.setValueAtTime(150, t)
    thudFilter.Q.setValueAtTime(1, t)
    const thudGain = ctx.createGain()
    thudGain.gain.setValueAtTime(0.8, t)
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
    thudNode.connect(thudFilter)
    dryWet(thudFilter, thudGain)
    thudNode.start(t)
    thudNode.stop(t + 0.6)

    // ===== 2) HEARTBEAT SUB-BASS THROBS (tension builder) =====
    const heartbeatTimes = [0.8, 1.4, 2.4, 3.0, 3.8, 4.2]
    heartbeatTimes.forEach((ht) => {
      const hb = ctx.createOscillator()
      const hbG = ctx.createGain()
      hb.type = 'sine'
      hb.frequency.setValueAtTime(35, t + ht)
      hb.frequency.exponentialRampToValueAtTime(22, t + ht + 0.35)
      hbG.gain.setValueAtTime(0.4, t + ht)
      hbG.gain.exponentialRampToValueAtTime(0.001, t + ht + 0.4)
      hb.connect(hbG)
      hbG.connect(masterGain)
      hb.start(t + ht)
      hb.stop(t + ht + 0.45)
    })

    // ===== 3) EERIE ATMOSPHERIC PAD (dark minor chord) =====
    const padFreqs = [65.41, 77.78, 98.0] // C2, Eb2, G2 -- Cm chord
    padFreqs.forEach((freq, i) => {
      const pad = ctx.createOscillator()
      const padG = ctx.createGain()
      const padF = ctx.createBiquadFilter()
      pad.type = 'sawtooth'
      pad.frequency.setValueAtTime(freq, t + 0.4)
      pad.frequency.linearRampToValueAtTime(freq * 1.02, t + 5.5) // slight detune drift
      padF.type = 'lowpass'
      padF.frequency.setValueAtTime(120, t + 0.4)
      padF.frequency.linearRampToValueAtTime(600 + i * 100, t + 4.0)
      padF.frequency.linearRampToValueAtTime(80, t + 6.0)
      padF.Q.setValueAtTime(3, t)
      padG.gain.setValueAtTime(0, t)
      padG.gain.linearRampToValueAtTime(0.08, t + 2.0)
      padG.gain.linearRampToValueAtTime(0.12, t + 4.0)
      padG.gain.exponentialRampToValueAtTime(0.001, t + 6.0)
      pad.connect(padF)
      dryWet(padF, padG)
      pad.start(t + 0.4)
      pad.stop(t + 6.0)
    })

    // ===== 4) SHEPARD TONE (ever-rising tension illusion) =====
    for (let layer = 0; layer < 4; layer++) {
      const shepard = ctx.createOscillator()
      const shepG = ctx.createGain()
      const baseFreq = 55 * Math.pow(2, layer)
      shepard.type = 'sine'
      shepard.frequency.setValueAtTime(baseFreq, t + 1.0)
      shepard.frequency.exponentialRampToValueAtTime(baseFreq * 2, t + 5.5)
      // Bell curve gain so layers overlap seamlessly
      const peakGain = layer === 1 || layer === 2 ? 0.06 : 0.025
      shepG.gain.setValueAtTime(0, t + 1.0)
      shepG.gain.linearRampToValueAtTime(peakGain, t + 3.0)
      shepG.gain.linearRampToValueAtTime(0, t + 5.5)
      shepard.connect(shepG)
      shepG.connect(masterGain)
      shepard.start(t + 1.0)
      shepard.stop(t + 5.5)
    }

    // ===== 5) RADIO STATIC WITH VOICE-LIKE FILTERING =====
    const staticLen = ctx.sampleRate * 5
    const staticBuf = ctx.createBuffer(1, staticLen, ctx.sampleRate)
    const staticData = staticBuf.getChannelData(0)
    for (let i = 0; i < staticLen; i++) {
      // Gated crackle effect
      const gate = Math.sin(i / ctx.sampleRate * 12) > 0.3 ? 1 : 0.1
      staticData[i] = (Math.random() * 2 - 1) * gate
    }
    const staticNode = ctx.createBufferSource()
    staticNode.buffer = staticBuf
    const staticF1 = ctx.createBiquadFilter()
    staticF1.type = 'bandpass'
    staticF1.frequency.setValueAtTime(1800, t)
    staticF1.frequency.linearRampToValueAtTime(4500, t + 3.0)
    staticF1.frequency.linearRampToValueAtTime(2000, t + 5.0)
    staticF1.Q.setValueAtTime(2.5, t)
    const staticG = ctx.createGain()
    staticG.gain.setValueAtTime(0, t)
    staticG.gain.linearRampToValueAtTime(0.04, t + 0.2)
    staticG.gain.setValueAtTime(0.04, t + 0.8)
    staticG.gain.linearRampToValueAtTime(0.015, t + 2.0)
    staticG.gain.linearRampToValueAtTime(0.03, t + 3.5)
    staticG.gain.exponentialRampToValueAtTime(0.001, t + 5.0)
    staticNode.connect(staticF1)
    staticF1.connect(staticG)
    staticG.connect(masterGain)
    staticNode.start(t)
    staticNode.stop(t + 5.0)

    // ===== 6) METALLIC SONAR PINGS (with decay tail) =====
    const pingTimes = [0.6, 2.2, 4.0]
    const pingFreqList = [1100, 1480, 1760]
    pingTimes.forEach((pt, i) => {
      // Main ping tone
      const ping = ctx.createOscillator()
      const pingG = ctx.createGain()
      ping.type = 'sine'
      ping.frequency.setValueAtTime(pingFreqList[i], t + pt)
      ping.frequency.exponentialRampToValueAtTime(pingFreqList[i] * 0.92, t + pt + 2.0)
      pingG.gain.setValueAtTime(0.3 - i * 0.05, t + pt)
      pingG.gain.exponentialRampToValueAtTime(0.001, t + pt + 2.5)
      dryWet(ping, pingG)
      ping.start(t + pt)
      ping.stop(t + pt + 2.5)

      // Harmonic overtone
      const harm = ctx.createOscillator()
      const harmG = ctx.createGain()
      harm.type = 'sine'
      harm.frequency.setValueAtTime(pingFreqList[i] * 2.5, t + pt)
      harmG.gain.setValueAtTime(0.05, t + pt)
      harmG.gain.exponentialRampToValueAtTime(0.001, t + pt + 1.0)
      harm.connect(harmG)
      harmG.connect(masterGain)
      harm.start(t + pt)
      harm.stop(t + pt + 1.0)
    })

    // ===== 7) DEEP MECHANICAL GROANING HUM =====
    const groan = ctx.createOscillator()
    const groanG = ctx.createGain()
    const groanF = ctx.createBiquadFilter()
    groan.type = 'sawtooth'
    groan.frequency.setValueAtTime(28, t)
    groan.frequency.linearRampToValueAtTime(32, t + 3.0)
    groan.frequency.linearRampToValueAtTime(25, t + 6.0)
    groanF.type = 'lowpass'
    groanF.frequency.setValueAtTime(80, t)
    groanF.Q.setValueAtTime(5, t)
    groanG.gain.setValueAtTime(0, t)
    groanG.gain.linearRampToValueAtTime(0.2, t + 1.0)
    groanG.gain.setValueAtTime(0.2, t + 4.5)
    groanG.gain.exponentialRampToValueAtTime(0.001, t + 6.2)
    groan.connect(groanF)
    dryWet(groanF, groanG)
    groan.start(t)
    groan.stop(t + 6.2)

    // ===== 8) TACTICAL CLICK / TICK SEQUENCE =====
    const clickTimes = [0.15, 0.5, 0.85, 1.6, 2.4, 3.2, 3.6, 4.4, 5.0]
    clickTimes.forEach((ct) => {
      const clickBuf = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate)
      const clickD = clickBuf.getChannelData(0)
      for (let i = 0; i < clickD.length; i++) {
        clickD[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / clickD.length, 20)
      }
      const clickN = ctx.createBufferSource()
      clickN.buffer = clickBuf
      const clickG = ctx.createGain()
      const clickF = ctx.createBiquadFilter()
      clickF.type = 'highpass'
      clickF.frequency.setValueAtTime(2000, t)
      clickG.gain.setValueAtTime(0.25, t + ct)
      clickG.gain.exponentialRampToValueAtTime(0.001, t + ct + 0.05)
      clickN.connect(clickF)
      clickF.connect(clickG)
      clickG.connect(masterGain)
      clickN.start(t + ct)
      clickN.stop(t + ct + 0.05)
    })

    // ===== 9) ALARM TONE BURST (brief, at title reveal) =====
    const alarmT = 0.58
    for (let a = 0; a < 3; a++) {
      const alarm = ctx.createOscillator()
      const alarmG = ctx.createGain()
      alarm.type = 'square'
      alarm.frequency.setValueAtTime(440, t + alarmT + a * 0.12)
      alarm.frequency.setValueAtTime(520, t + alarmT + a * 0.12 + 0.04)
      alarmG.gain.setValueAtTime(0.07, t + alarmT + a * 0.12)
      alarmG.gain.exponentialRampToValueAtTime(0.001, t + alarmT + a * 0.12 + 0.1)
      alarm.connect(alarmG)
      alarmG.connect(masterGain)
      alarm.start(t + alarmT + a * 0.12)
      alarm.stop(t + alarmT + a * 0.12 + 0.12)
    }

    // ===== 10) FINAL POWER-DOWN SWEEP + BASS DROP =====
    // Reverse sweep (high to low -- feels like systems locking in)
    const sweep = ctx.createOscillator()
    const sweepG = ctx.createGain()
    const sweepF = ctx.createBiquadFilter()
    sweep.type = 'sawtooth'
    sweep.frequency.setValueAtTime(3000, t + 4.8)
    sweep.frequency.exponentialRampToValueAtTime(40, t + 5.8)
    sweepF.type = 'lowpass'
    sweepF.frequency.setValueAtTime(5000, t + 4.8)
    sweepF.frequency.exponentialRampToValueAtTime(100, t + 5.8)
    sweepG.gain.setValueAtTime(0, t + 4.8)
    sweepG.gain.linearRampToValueAtTime(0.15, t + 5.1)
    sweepG.gain.exponentialRampToValueAtTime(0.001, t + 6.0)
    sweep.connect(sweepF)
    dryWet(sweepF, sweepG)
    sweep.start(t + 4.8)
    sweep.stop(t + 6.0)

    // Final sub bass drop impact
    const drop = ctx.createOscillator()
    const dropG = ctx.createGain()
    drop.type = 'sine'
    drop.frequency.setValueAtTime(50, t + 5.6)
    drop.frequency.exponentialRampToValueAtTime(20, t + 6.2)
    dropG.gain.setValueAtTime(0.6, t + 5.6)
    dropG.gain.exponentialRampToValueAtTime(0.001, t + 6.2)
    dryWet(drop, dropG)
    drop.start(t + 5.6)
    drop.stop(t + 6.2)

    // ===== 11) BREATHING / WIND ATMOSPHERE =====
    const windLen = ctx.sampleRate * 6
    const windBuf = ctx.createBuffer(1, windLen, ctx.sampleRate)
    const windData = windBuf.getChannelData(0)
    for (let i = 0; i < windLen; i++) {
      const env = Math.sin((i / windLen) * Math.PI) // smooth bell curve
      windData[i] = (Math.random() * 2 - 1) * env
    }
    const windNode = ctx.createBufferSource()
    windNode.buffer = windBuf
    const windF = ctx.createBiquadFilter()
    windF.type = 'bandpass'
    windF.frequency.setValueAtTime(400, t)
    windF.frequency.linearRampToValueAtTime(800, t + 3.0)
    windF.frequency.linearRampToValueAtTime(300, t + 6.0)
    windF.Q.setValueAtTime(0.5, t)
    const windG = ctx.createGain()
    windG.gain.setValueAtTime(0.035, t)
    windNode.connect(windF)
    windF.connect(windG)
    windG.connect(masterGain)
    windNode.start(t)
    windNode.stop(t + 6.0)

    // ===== MASTER FADE =====
    masterGain.gain.setValueAtTime(0.7, t + 5.5)
    masterGain.gain.linearRampToValueAtTime(0, t + 6.5)

    setTimeout(() => ctx.close().catch(() => {}), 7500)
    return ctx
  } catch {
    return null
  }
}

export default function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'boot' | 'title' | 'subtitle' | 'status' | 'exit'>('boot')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  const startSequence = useCallback(() => {
    if (hasInteracted) return
    setHasInteracted(true)

    // Play military suspense sound via Web Audio API
    audioCtxRef.current = playMilitaryIntroSound()

    // Phase timeline
    setTimeout(() => setPhase('title'), 600)
    setTimeout(() => setPhase('subtitle'), 2200)
    setTimeout(() => setPhase('status'), 3400)
    setTimeout(() => setPhase('exit'), 5400)
    setTimeout(() => {
      onComplete()
    }, 6200)
  }, [hasInteracted, onComplete])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [])

  // Scramble text effect
  const ScrambleText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    const [display, setDisplay] = useState('')
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'

    useEffect(() => {
      let timeout: NodeJS.Timeout
      let interval: NodeJS.Timeout
      let iteration = 0

      timeout = setTimeout(() => {
        interval = setInterval(() => {
          setDisplay(
            text
              .split('')
              .map((char, idx) => {
                if (char === ' ') return ' '
                if (idx < iteration) return text[idx]
                return chars[Math.floor(Math.random() * chars.length)]
              })
              .join('')
          )
          iteration += 1 / 2
          if (iteration >= text.length) {
            setDisplay(text)
            clearInterval(interval)
          }
        }, 40)
      }, delay)

      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }, [text, delay])

    return <>{display}</>
  }

  // Boot sequence lines
  const bootLines = [
    'INITIALIZING SECURE UPLINK...',
    'CONNECTING TO SATELLITE NETWORK...',
    'DECRYPTING INTELLIGENCE FEEDS...',
    'CALIBRATING THREAT MATRIX...',
    'LOADING GEOSPATIAL MODULES...',
    'SYSTEM ARMED // READY',
  ]

  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-sentinel-navy">
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.1) 2px, rgba(0,229,255,0.1) 4px)',
          }}
        />

        <motion.button
          onClick={startSequence}
          className="relative flex flex-col items-center gap-6 cursor-pointer group bg-transparent border-none outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Outer ring */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border border-sentinel-cyan/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-sentinel-cyan/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                borderTopColor: 'rgba(0, 229, 255, 0.6)',
              }}
            />
            <div className="w-16 h-16 rounded-full border-2 border-sentinel-cyan/40 flex items-center justify-center group-hover:border-sentinel-cyan/80 transition-colors duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-sentinel-cyan ml-1">
                <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-sentinel-cyan/70 font-mono text-xs tracking-[0.3em] uppercase">
              Click to Initialize
            </span>
            <span className="text-sentinel-cyan/40 font-mono text-[10px] tracking-[0.2em]">
              GEOPULSE SENTINEL v3.7.1
            </span>
          </div>

          {/* Corner brackets */}
          <div className="absolute -inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-sentinel-cyan/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-sentinel-cyan/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-sentinel-cyan/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-sentinel-cyan/30" />
          </div>
        </motion.button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {phase !== 'exit' ? null : null}
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-sentinel-navy overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        key="intro-overlay"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Scanline */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sentinel-cyan/20 to-transparent pointer-events-none"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Radar sweep */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[600px] h-[600px] rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,229,255,0.06) 40deg, transparent 60deg)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[200, 320, 440].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border border-sentinel-cyan/[0.06]"
              style={{ width: size, height: size }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Boot sequence text - top left */}
        <div className="absolute top-8 left-8 font-mono text-[11px] text-sentinel-cyan/50 leading-relaxed">
          {phase !== 'boot' ? (
            bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.15 }}
              >
                <span className="text-sentinel-cyan/30 mr-2">{'>'}</span>
                {line}
              </motion.div>
            ))
          ) : (
            bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.15 }}
              >
                <span className="text-sentinel-cyan/30 mr-2">{'>'}</span>
                {line}
              </motion.div>
            ))
          )}
        </div>

        {/* System metrics - top right */}
        <div className="absolute top-8 right-8 font-mono text-[10px] text-sentinel-cyan/40 text-right leading-relaxed">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            UPLINK: <span className="text-sentinel-green">ACTIVE</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            ENCRYPTION: <span className="text-sentinel-green">AES-256</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            CLEARANCE: <span className="text-sentinel-amber">LEVEL 5</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            FREQ: <span className="text-sentinel-cyan/60">4.7 GHz</span>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Horizontal line top */}
          <motion.div
            className="h-[1px] bg-gradient-to-r from-transparent via-sentinel-cyan/60 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: 500 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Emblem / crosshair */}
          <motion.div
            className="relative w-20 h-20 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', damping: 15 }}
          >
            <div className="absolute inset-0 rounded-full border border-sentinel-cyan/30" />
            <div className="absolute inset-3 rounded-full border border-sentinel-cyan/20" />
            {/* Crosshair lines */}
            <div className="absolute top-0 left-1/2 w-[1px] h-3 bg-sentinel-cyan/40 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-[1px] h-3 bg-sentinel-cyan/40 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-3 h-[1px] bg-sentinel-cyan/40 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-3 h-[1px] bg-sentinel-cyan/40 -translate-y-1/2" />
            <motion.div
              className="w-3 h-3 rounded-full bg-sentinel-cyan/80"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Title */}
          <div className="flex flex-col items-center gap-3">
            <motion.h1
              className="font-[Orbitron] text-5xl md:text-7xl font-bold tracking-[0.2em] text-sentinel-cyan"
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={
                phase === 'title' || phase === 'subtitle' || phase === 'status' || phase === 'exit'
                  ? { opacity: 1, letterSpacing: '0.2em' }
                  : { opacity: 0, letterSpacing: '0.6em' }
              }
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                textShadow: '0 0 40px rgba(0,229,255,0.5), 0 0 80px rgba(0,229,255,0.2), 0 0 120px rgba(0,229,255,0.1)',
              }}
            >
              <ScrambleText text="GEOPULSE" delay={600} />
            </motion.h1>

            <motion.h2
              className="font-[Orbitron] text-2xl md:text-4xl font-semibold tracking-[0.35em] text-sentinel-cyan/70"
              initial={{ opacity: 0, y: 10 }}
              animate={
                phase === 'title' || phase === 'subtitle' || phase === 'status' || phase === 'exit'
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              style={{
                textShadow: '0 0 20px rgba(0,229,255,0.3)',
              }}
            >
              <ScrambleText text="SENTINEL" delay={1000} />
            </motion.h2>
          </div>

          {/* Separator */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={
              phase === 'subtitle' || phase === 'status' || phase === 'exit'
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-[1px] bg-sentinel-cyan/30" />
            <div className="w-1.5 h-1.5 rotate-45 border border-sentinel-cyan/50" />
            <div className="w-8 h-[1px] bg-sentinel-cyan/30" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="font-mono text-sm md:text-base tracking-[0.4em] text-sentinel-cyan/50 uppercase text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={
              phase === 'subtitle' || phase === 'status' || phase === 'exit'
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 5 }
            }
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <ScrambleText text="GLOBAL INTELLIGENCE MONITORING SYSTEM" delay={2200} />
          </motion.p>

          {/* Horizontal line bottom */}
          <motion.div
            className="h-[1px] bg-gradient-to-r from-transparent via-sentinel-cyan/60 to-transparent"
            initial={{ width: 0 }}
            animate={
              phase === 'subtitle' || phase === 'status' || phase === 'exit'
                ? { width: 500 }
                : { width: 0 }
            }
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Status line */}
          <motion.div
            className="flex items-center gap-4 font-mono text-xs tracking-[0.2em]"
            initial={{ opacity: 0 }}
            animate={
              phase === 'status' || phase === 'exit'
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5 }}
          >
            <span className="text-sentinel-green/80 flex items-center gap-2">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full bg-sentinel-green"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              SYSTEMS ONLINE
            </span>
            <span className="text-sentinel-cyan/30">|</span>
            <span className="text-sentinel-amber/80 flex items-center gap-2">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full bg-sentinel-amber"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              />
              THREAT LEVEL ELEVATED
            </span>
            <span className="text-sentinel-cyan/30">|</span>
            <span className="text-sentinel-cyan/60">
              LAUNCHING DASHBOARD...
            </span>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="w-72 h-[2px] bg-sentinel-cyan/10 rounded-full overflow-hidden mt-2"
            initial={{ opacity: 0 }}
            animate={
              phase === 'status' || phase === 'exit'
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-sentinel-cyan/80 to-sentinel-cyan"
              initial={{ width: '0%' }}
              animate={
                phase === 'status' || phase === 'exit'
                  ? { width: '100%' }
                  : { width: '0%' }
              }
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 0 10px rgba(0,229,255,0.6), 0 0 20px rgba(0,229,255,0.3)',
              }}
            />
          </motion.div>
        </div>

        {/* Bottom classification */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-sentinel-red/40 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {'// TOP SECRET // SCI // NOFORN //'}
        </motion.div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-sentinel-cyan/20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-sentinel-cyan/20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-sentinel-cyan/20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-sentinel-cyan/20" />

        {/* Fade to white flash on exit */}
        <AnimatePresence>
          {phase === 'exit' && (
            <motion.div
              className="absolute inset-0 bg-sentinel-cyan/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
