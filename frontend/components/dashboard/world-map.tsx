'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Country, GlobalEvent, FilterState } from '@/lib/dashboard-data'
import { countries, globalEvents, riskLevelConfig, eventTypeConfig } from '@/lib/dashboard-data'
import { fetchLiveFlights, fetchLiveConflicts } from '@/lib/api'

interface WorldMapProps {
  onCountrySelect: (country: Country) => void
  selectedCountry: Country | null
  filters: FilterState
}

// Cardinal direction from degrees
function getCardinal(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

// Pre-render a single small plane icon to OffscreenCanvas
function createPlaneIcon(): OffscreenCanvas | HTMLCanvasElement {
  const size = 12
  if (typeof OffscreenCanvas !== 'undefined') {
    const oc = new OffscreenCanvas(size, size)
    const ctx = oc.getContext('2d')!
    ctx.fillStyle = 'rgba(100, 180, 255, 0.85)'
    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.lineTo(10, 10)
    ctx.lineTo(6, 8)
    ctx.lineTo(2, 10)
    ctx.closePath()
    ctx.fill()
    return oc
  } else {
    // Fallback for environments without OffscreenCanvas
    const c = document.createElement('canvas')
    c.width = size; c.height = size
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(100, 180, 255, 0.85)'
    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.lineTo(10, 10)
    ctx.lineTo(6, 8)
    ctx.lineTo(2, 10)
    ctx.closePath()
    ctx.fill()
    return c
  }
}

export default function WorldMap({ onCountrySelect, selectedCountry, filters }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const conflictNodesRef = useRef<any[]>([])
  const planeIconRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const flightsRef = useRef<any[]>([]) // latest flights (not state, to avoid re-renders)
  const needsRedrawRef = useRef(false)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [liveConflicts, setLiveConflicts] = useState<any[]>([])

  // Fetch Flights — Performance optimized rAF loop
  useEffect(() => {
    if (!filters.flights) {
      flightsRef.current = []
      needsRedrawRef.current = true
      return
    }

    let lastFetch = 0
    let rafId: number

    const loop = () => {
      const now = Date.now()
      if (now - lastFetch > 10000) {
        lastFetch = now
        fetchLiveFlights().then(data => {
          flightsRef.current = data
          needsRedrawRef.current = true
        }).catch(() => {})
      }
      rafId = requestAnimationFrame(loop)
    }
    
    loop()
    return () => cancelAnimationFrame(rafId)
  }, [filters.flights])

  // Fetch Conflicts
  useEffect(() => {
    if (!filters.conflicts) return
    const get = async () => {
      const data = await fetchLiveConflicts()
      setLiveConflicts(data)
    }
    get()
    const interval = setInterval(get, 60000)
    return () => clearInterval(interval)
  }, [filters.conflicts])

  // Build singleton tooltip element
  useEffect(() => {
    const tip = document.createElement('div')
    tip.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: rgba(6, 15, 26, 0.92);
      border: 1px solid rgba(26, 58, 85, 0.8);
      border-radius: 4px;
      padding: 8px 10px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(43,123,232,0.15);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #B0C4D8;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.1s ease, transform 0.1s ease;
      min-width: 160px;
    `
    document.body.appendChild(tip)
    tooltipRef.current = tip
    return () => { tip.remove(); tooltipRef.current = null }
  }, [])

  const showTooltip = useCallback((html: string, x: number, y: number) => {
    const tip = tooltipRef.current
    if (!tip) return
    tip.innerHTML = html
    tip.style.opacity = '0'
    tip.style.display = 'block'
    
    // Smart positioning
    const tw = 170, th = 90
    let tx = x + 14, ty = y - 20
    if (tx + tw > window.innerWidth - 20) tx = x - tw - 14
    if (ty + th > window.innerHeight - 20) ty = y - th - 10
    if (ty < 10) ty = y + 14
    tip.style.left = tx + 'px'
    tip.style.top = ty + 'px'
    
    requestAnimationFrame(() => {
      tip.style.opacity = '1'
      tip.style.transform = 'translateY(0)'
    })
  }, [])

  const hideTooltip = useCallback(() => {
    const tip = tooltipRef.current
    if (!tip) return
    tip.style.opacity = '0'
    tip.style.transform = 'translateY(4px)'
  }, [])

  // Canvas flight render loop
  const startRenderLoop = useCallback((map: any, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!
    if (!planeIconRef.current) planeIconRef.current = createPlaneIcon()

    let lastTime = performance.now()

    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      
      const flights = flightsRef.current

      const now = performance.now()
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (flights && flights.length > 0) {
        needsRedrawRef.current = true
        flights.forEach(f => {
          if (typeof f.velocity === 'number' && typeof f.true_track === 'number') {
            const hdgRad = (f.true_track * Math.PI) / 180
            const dist = f.velocity * dt
            // Note: Heading 0° is North. 
            // Leaflet/geo coordinates: Lat increases North, Lng increases East.
            // A heading of 0 means dLat is positive, dLng is 0.
            f.latitude += (dist * Math.cos(hdgRad)) / 111139
            const cosLat = Math.cos((f.latitude * Math.PI) / 180)
            f.longitude += (dist * Math.sin(hdgRad)) / (111139 * (cosLat === 0 ? 1 : cosLat))
          }
        })
      }

      if (!needsRedrawRef.current) return
      needsRedrawRef.current = false

      // Guard against Leaflet not being fully ready (race condition with _leaflet_pos)
      try {
        const zoom = map.getZoom()
        const bounds = map.getBounds()
        const mapSize = map.getSize()
        
        // Optimize: Only set canvas dimensions if they've changed to avoid unnecessary DOM paints
        if (canvas.width !== mapSize.x || canvas.height !== mapSize.y) {
          canvas.width = mapSize.x
          canvas.height = mapSize.y
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!flights || flights.length === 0) return

        // Viewport cull (no hard count limit)
        const visible = flights
          .filter(f =>
            f.latitude > bounds.getSouth() - 2 &&
            f.latitude < bounds.getNorth() + 2 &&
            f.longitude > bounds.getWest() - 2 &&
            f.longitude < bounds.getEast() + 2
          )

        // LOD: zoom < 2 → nothing
        if (zoom < 2) return

        const planeImg = planeIconRef.current!

        // zoom 2+: always draw plane icons, adjust size by zoom
        const iconSize = zoom >= 4 ? 9 : (zoom === 3 ? 7 : 5)
        const alpha = zoom >= 4 ? 0.8 : 0.6

        visible.forEach(f => {
          const pt = map.latLngToContainerPoint([f.latitude, f.longitude])
          const headingRad = ((f.true_track || 0) * Math.PI) / 180

          ctx.save()
          ctx.translate(pt.x, pt.y)
          ctx.rotate(headingRad)
          ctx.globalAlpha = alpha
          ctx.drawImage(planeImg as any, -iconSize / 2, -iconSize / 2, iconSize, iconSize)
          ctx.restore()
        })
      } catch {
        // Map not ready yet, skip this frame
      }
    }

    render()
  }, [])

  // Canvas hover events for tooltips
  const setupCanvasHover = useCallback((canvas: HTMLCanvasElement, map: any) => {
    canvas.style.pointerEvents = 'none'
    let hoverTimeout: any

    map.on('mousemove', (e: any) => {
      clearTimeout(hoverTimeout)
      hoverTimeout = setTimeout(() => {
        const zoom = map.getZoom()
        if (zoom < 3) { hideTooltip(); return }

        const flights = flightsRef.current
        const mx = e.containerPoint.x
        const my = e.containerPoint.y
        const HIT = 10

        const hit = flights.find(f => {
          const pt = map.latLngToContainerPoint([f.latitude, f.longitude])
          return Math.abs(pt.x - mx) < HIT && Math.abs(pt.y - my) < HIT
        })

        if (hit) {
          const spd = ((hit.velocity || 0) * 3.6).toFixed(0)
          const alt = (hit.altitude || 0).toFixed(0)
          const hdg = (hit.true_track || 0).toFixed(0)
          const card = getCardinal(hit.true_track || 0)
          const html = `
            <div style="color:#4DA3FF;font-weight:bold;font-size:11px;margin-bottom:4px;">✈ ${hit.callsign || 'UNKNWN'}</div>
            <div style="display:grid;grid-template-columns:36px 1fr;gap:2px;">
              <span style="color:#4A7FA0;">ALT</span><span>${alt} m</span>
              <span style="color:#4A7FA0;">SPD</span><span>${spd} km/h</span>
              <span style="color:#4A7FA0;">HDG</span><span>${hdg}° ${card}</span>
            </div>
          `
          showTooltip(html, e.originalEvent.clientX, e.originalEvent.clientY)
        } else {
          hideTooltip()
        }
      }, 60)
    })

    map.on('mouseout', () => {
      clearTimeout(hoverTimeout)
      hideTooltip()
    })
  }, [showTooltip, hideTooltip])

  const initMap = useCallback(async () => {
    if (!mapRef.current) return

    const L = (await import('leaflet')).default
    // @ts-ignore - TS doesn't type generic CSS imports out of the box
    await import('leaflet/dist/leaflet.css')

    // Prevent "Map container is already initialized" on HMR / React strict mode
    if (leafletMapRef.current) {
      leafletMapRef.current.remove()
      leafletMapRef.current = null
    }
    // Also clear any stale Leaflet state on the DOM node itself
    const container = mapRef.current as any
    if (container._leaflet_id) {
      container._leaflet_id = null
      container.innerHTML = ''
    }

    const map = L.map(mapRef.current, {
      center: [20, 15],
      zoom: 1.5,
      minZoom: 2,
      maxZoom: 8,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      zoomControl: false, // We'll add it manually to bottomright
      attributionControl: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
      worldCopyJump: true,
      zoomAnimation: true,
    })

    // Immediate fit to world bounds preventing mis-cropped views
    const bounds = L.latLngBounds([[-60, -180], [85, 180]])
    map.fitBounds(bounds, { padding: [20, 20] })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Match dashboard background exactly
    map.getContainer().style.background = '#050D1A'

    // FOSS Strict OpenStreetMap API - Styled via CSS for Tactical UI
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'osm-tactical-tiles',
      opacity: 0.65,
    }).addTo(map)

    // Inject CSS for the sharp markers, enlarged click-targets, and tactical map filters
    if (!document.getElementById('map-custom-css')) {
      const style = document.createElement('style')
      style.id = 'map-custom-css'
      style.innerHTML = `
        .osm-tactical-tiles {
          /* Convert standard bright OSM map into a deep navy tactical intelligence overlay */
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(120%) saturate(60%);
        }
        .leaflet-pane {
          filter: brightness(0.85);
        }
        
        .intel-dot-wrapper {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .intel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.9);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .intel-dot-wrapper:hover .intel-dot {
          transform: scale(1.6);
          box-shadow: 0 0 12px currentColor;
        }
        .intel-dot.critical { background: #ff3b5c; }
        .intel-dot.high { background: #ff8c00; }
        .intel-dot.medium { background: #ffb020; }
        .intel-dot.low { background: #00ffa3; }

        .anim-dash-line {
          stroke-dasharray: 6 6 !important;
          animation: mapDashMove 1.5s linear infinite !important;
        }
        @keyframes mapDashMove {
          to { stroke-dashoffset: -20; }
        }
      `
      document.head.appendChild(style)
    }

    leafletMapRef.current = map
    setIsLoaded(true)

    // Set up flight canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.zIndex = '450' // Must sit above map tiles (200) but below marker pane (600)
      canvas.style.pointerEvents = 'none'
      
      const mapContainer = map.getContainer()
      // Append strictly to mapContainer root to act as a flawless static HUD overlay
      mapContainer.appendChild(canvas)

      // Debounced redraw on map move
      let moveTimeout: any
      map.on('move zoom', () => {
        clearTimeout(moveTimeout)
        moveTimeout = setTimeout(() => { needsRedrawRef.current = true }, 150)
      })

      startRenderLoop(map, canvas)
      setupCanvasHover(canvas, map)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      map.remove()
      leafletMapRef.current = null
    }
  }, [startRenderLoop, setupCanvasHover])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    initMap().then(fn => { cleanup = fn })
    return () => {
      if (cleanup) cleanup()
    }
  }, [initMap])

  // Country & Event markers
  useEffect(() => {
    if (!leafletMapRef.current || !isLoaded) return
    const L = require('leaflet')
    const map = leafletMapRef.current

    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    countries.forEach(country => {
      const config = riskLevelConfig[country.riskLevel]
      
      const markerHtml = `
        <div class="intel-dot-wrapper" style="color: ${config.color}">
          <div class="intel-dot ${country.riskLevel}"></div>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      
      const marker = L.marker([country.lat, country.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => onCountrySelect(country))
        .on('mouseover', (e: any) => {
          const html = `
            <div style="color:${config.color};font-weight:bold;font-size:11px;margin-bottom:4px;">${country.flag} ${country.name}</div>
            <div style="display:grid;grid-template-columns:52px 1fr;gap:2px;">
              <span style="color:#4A7FA0;">RISK</span><span style="color:${config.color};">${config.label} (${country.riskScore})</span>
              <span style="color:#4A7FA0;">REGION</span><span>${country.region}</span>
            </div>
          `
          showTooltip(html, e.originalEvent.clientX, e.originalEvent.clientY)
        })
        .on('mouseout', hideTooltip)

      markersRef.current.push(marker)
    })

    // Event markers
    const typeToFilter: Record<string, keyof typeof filters> = {
      earthquake: 'earthquakes', wildfire: 'wildfires', storm: 'storms', conflict: 'conflicts', market: 'markets',
    }

    globalEvents.forEach((event: GlobalEvent) => {
      const filterKey = typeToFilter[event.type]
      if (filterKey && !filters[filterKey]) return
      const config = eventTypeConfig[event.type]
      if (!config) return

      const icon = L.divIcon({
        html: `<div style="position:relative;width:8px;height:8px;">
          <div style="position:absolute;inset:0;width:8px;height:8px;background:${config.color};opacity:0.6;transform:rotate(45deg);"></div>
        </div>`,
        iconSize: [8, 8], iconAnchor: [4, 4], className: '',
      })

      const marker = L.marker([event.lat, event.lng], { icon }).addTo(map)
        .on('mouseover', (e: any) => {
          const html = `
            <div style="color:${config.color};font-weight:bold;font-size:9px;letter-spacing:0.1em;margin-bottom:4px;">${config.label}</div>
            <div style="font-size:11px;color:#C8D8E8;font-weight:500;line-height:1.4;">${event.title}</div>
          `
          showTooltip(html, e.originalEvent.clientX, e.originalEvent.clientY)
        })
        .on('mouseout', hideTooltip)

      markersRef.current.push(marker)
    })
  }, [isLoaded, selectedCountry, onCountrySelect, filters, showTooltip, hideTooltip])

  // Update canvas filter state when flights toggle changes
  useEffect(() => {
    needsRedrawRef.current = true
  }, [filters.flights])

  // Conflict Arc Lines
  useEffect(() => {
    if (!leafletMapRef.current || !isLoaded) return
    const L = require('leaflet')
    const map = leafletMapRef.current

    conflictNodesRef.current.forEach(layer => map.removeLayer(layer))
    conflictNodesRef.current = []

    if (!filters.conflicts) return

    liveConflicts.forEach(conflict => {
      if (conflict.coordinates && conflict.coordinates.length >= 2) {
        const isHighTension = conflict.severity === 'high'
        const polyline = L.polyline(conflict.coordinates, {
          color: isHighTension ? 'rgba(255, 122, 26, 0.4)' : 'rgba(255, 59, 92, 0.5)',
          weight: 2,
          opacity: 1,
          className: 'anim-dash-line',
        }).addTo(map)
        conflictNodesRef.current.push(polyline)
      }
    })
  }, [liveConflicts, filters.conflicts, isLoaded])

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden">
      {/* Noise Texture Overlay for Intelligence System Vibe */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", opacity: 0.04, mixBlendMode: 'overlay' }} 
      />

      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Canvas for flight rendering */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }} />

      {/* Tactical Grid Overlay (Very Low opacity) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.02
        }}
      />

      {/* Radar Sweep */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-[0.06]">
        <style>{`@keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 229, 255, 0.3) 30deg, transparent 60deg)', animation: 'radar-spin 4s linear infinite' }}
        />
      </div>

      {/* Scan Line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-cyan/20 to-transparent z-10 pointer-events-none animate-scan-line" />

      {/* HUD Elements */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="text-[10px] font-mono text-[var(--text-secondary)] tracking-wider">
          <div>LAT: 00.0000 N</div>
          <div>LNG: 00.0000 E</div>
          <div className="mt-1 text-[var(--text-muted)]">PROJECTION: MERCATOR</div>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <div className="text-[10px] font-mono text-[var(--text-secondary)] tracking-wider text-right">
          <div>ZOOM: 2.5x</div>
          <div>LAYER: TACTICAL</div>
          <div className="mt-1 text-[var(--text-muted)]">FEED: LIVE</div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="flex items-center gap-3 text-[9px] font-mono tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sentinel-red animate-pulse-dot" />
            <span className="text-sentinel-red/80">CRITICAL</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8C00]" />
            <span className="text-[#FF8C00]/80">HIGH</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sentinel-amber" />
            <span className="text-sentinel-amber/80">MEDIUM</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sentinel-green" />
            <span className="text-sentinel-green/80">LOW</span>
          </span>
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-2 border-sentinel-cyan/30 border-t-sentinel-cyan rounded-full animate-spin" />
            <span className="text-xs font-mono text-sentinel-cyan/60 tracking-widest">INITIALIZING MAP FEED</span>
          </div>
        </div>
      )}
    </div>
  )
}
