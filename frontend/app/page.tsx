'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/header'
import LeftSidebar from '@/components/dashboard/left-sidebar'
import CountryPanel from '@/components/dashboard/country-panel'
import EventTimeline from '@/components/dashboard/event-timeline'
import IntroOverlay from '@/components/dashboard/intro-overlay'
import type { Country, FilterState } from '@/lib/dashboard-data'

const WorldMap = dynamic(() => import('@/components/dashboard/world-map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-2 border-sentinel-cyan/30 border-t-sentinel-cyan rounded-full animate-spin" />
        <span className="text-xs font-mono text-sentinel-cyan/60 tracking-widest">LOADING MAP MODULE</span>
      </div>
    </div>
  ),
})

export default function GeoPulseDashboard() {
  const [showIntro, setShowIntro] = useState(true)
  const [dashboardReady, setDashboardReady] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    earthquakes: true,
    wildfires: true,
    storms: true,
    conflicts: true,
    markets: true,
    flights: true,
    satellites: true,
  })

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    setTimeout(() => setDashboardReady(true), 100)
  }, [])

  return (
    <>
      {/* Intro Overlay */}
      <AnimatePresence>
        {showIntro && <IntroOverlay onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Dashboard - always mounted but hidden behind intro */}
      <motion.div
        className="h-screen w-screen flex flex-col overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: dashboardReady ? 1 : 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Top Header */}
        <DashboardHeader />

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar: Filters + Stats */}
          <LeftSidebar filters={filters} onFiltersChange={setFilters} />

          {/* Center: World Map */}
          <WorldMap
            onCountrySelect={handleCountrySelect}
            selectedCountry={selectedCountry}
            filters={filters}
          />

          {/* Right Sidebar: Country Intel */}
          <CountryPanel country={selectedCountry} onClose={handleClosePanel} />
        </div>

        {/* Bottom: Event Timeline */}
        <EventTimeline />
      </motion.div>
    </>
  )
}
