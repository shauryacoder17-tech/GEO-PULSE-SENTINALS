'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Country, GlobalEvent } from '@/lib/dashboard-data'
import { countries, globalEvents, riskLevelConfig, eventTypeConfig } from '@/lib/dashboard-data'

interface WorldMapProps {
  onCountrySelect: (country: Country) => void
  selectedCountry: Country | null
  filters: {
    earthquakes: boolean
    wildfires: boolean
    storms: boolean
    conflicts: boolean
    markets: boolean
  }
}

export default function WorldMap({ onCountrySelect, selectedCountry, filters }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [radarAngle, setRadarAngle] = useState(0)

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 1) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  const initMap = useCallback(async () => {
    if (!mapRef.current || leafletMapRef.current) return

    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    const map = L.map(mapRef.current, {
      center: [20, 15],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 6,
      zoomControl: true,
      attributionControl: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
    })

    // Dark tactical tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
    }).addTo(map)

    // Country label layer (subtle)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      opacity: 0.4,
    }).addTo(map)

    leafletMapRef.current = map
    setIsLoaded(true)

    return () => {
      map.remove()
      leafletMapRef.current = null
    }
  }, [])

  useEffect(() => {
    initMap()
  }, [initMap])

  // Add markers
  useEffect(() => {
    if (!leafletMapRef.current || !isLoaded) return

    const L = require('leaflet')
    const map = leafletMapRef.current

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    // Country markers
    countries.forEach(country => {
      const config = riskLevelConfig[country.riskLevel]
      const isSelected = selectedCountry?.code === country.code
      const size = country.riskLevel === 'critical' ? 14 : country.riskLevel === 'high' ? 11 : 8

      const markerHtml = `
        <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${config.color};
            opacity:${isSelected ? 1 : 0.8};
            box-shadow:${isSelected ? config.glow.replace('12px', '20px') : config.glow};
          "></div>
          ${country.riskLevel === 'critical' || country.riskLevel === 'high' ? `
            <div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:1px solid ${config.color};
              opacity:0.4;
              animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            "></div>
          ` : ''}
          ${isSelected ? `
            <div style="
              position:absolute;inset:-10px;border-radius:50%;
              border:2px solid ${config.color};
              opacity:0.6;
              animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            "></div>
          ` : ''}
        </div>
      `

      const icon = L.divIcon({
        html: markerHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: '',
      })

      const marker = L.marker([country.lat, country.lng], { icon })
        .addTo(map)
        .on('click', () => onCountrySelect(country))

      marker.bindTooltip(
        `<div style="background:#111827;border:1px solid #1E293B;padding:6px 10px;border-radius:4px;font-family:monospace;font-size:11px;color:#E0E6ED;">
          <div style="color:${config.color};font-weight:bold;margin-bottom:2px;">${country.flag} ${country.name}</div>
          <div style="color:#6B7B8D;">RISK: <span style="color:${config.color}">${config.label}</span> (${country.riskScore})</div>
        </div>`,
        {
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
          className: 'leaflet-tooltip-custom',
        }
      )

      markersRef.current.push(marker)
    })

    // Event markers
    const typeToFilter: Record<string, keyof typeof filters> = {
      earthquake: 'earthquakes',
      wildfire: 'wildfires',
      storm: 'storms',
      conflict: 'conflicts',
      market: 'markets',
    }

    globalEvents.forEach((event: GlobalEvent) => {
      const filterKey = typeToFilter[event.type]
      if (filterKey && !filters[filterKey]) return

      const config = eventTypeConfig[event.type]
      if (!config) return

      const icon = L.divIcon({
        html: `
          <div style="position:relative;width:8px;height:8px;">
            <div style="
              position:absolute;inset:0;
              width:8px;height:8px;
              background:${config.color};
              opacity:0.6;
              transform:rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
        className: '',
      })

      const marker = L.marker([event.lat, event.lng], { icon }).addTo(map)

      marker.bindTooltip(
        `<div style="background:#111827;border:1px solid #1E293B;padding:6px 10px;border-radius:4px;font-family:monospace;font-size:10px;color:#E0E6ED;">
          <div style="color:${config.color};font-weight:bold;font-size:9px;margin-bottom:2px;">${config.label}</div>
          <div>${event.title}</div>
        </div>`,
        { direction: 'top', offset: [0, -8], opacity: 1, className: 'leaflet-tooltip-custom' }
      )

      markersRef.current.push(marker)
    })
  }, [isLoaded, selectedCountry, onCountrySelect, filters])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 map-grid-overlay z-10" />

      {/* Radar Sweep Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-[0.06]">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, rgba(0, 229, 255, 0.3) 30deg, transparent 60deg)`,
          }}
        />
      </div>

      {/* Scan Line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-cyan/20 to-transparent z-10 pointer-events-none animate-scan-line" />

      {/* Corner HUD Elements */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="text-[9px] font-mono text-sentinel-cyan/60 tracking-wider">
          <div>LAT: 00.0000 N</div>
          <div>LNG: 00.0000 E</div>
          <div className="mt-1 text-muted-foreground">PROJECTION: MERCATOR</div>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <div className="text-[9px] font-mono text-sentinel-cyan/60 tracking-wider text-right">
          <div>ZOOM: 2.5x</div>
          <div>LAYER: TACTICAL</div>
          <div className="mt-1 text-muted-foreground">FEED: LIVE</div>
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
