export interface Country {
  name: string
  code: string
  flag: string
  lat: number
  lng: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  weather: {
    temp: number
    condition: string
    humidity: number
    wind: number
  }
  disasters: Array<{ type: string; description: string; date: string }>
  conflictActive: boolean
  conflictDescription?: string
  goldIndicator: number
  flightDensity: number
  wildfireDetections: number
  marketData: number[]
  population: string
  region: string
}

export interface GlobalEvent {
  id: string
  type: 'earthquake' | 'wildfire' | 'storm' | 'conflict' | 'market'
  title: string
  location: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  lat: number
  lng: number
  description: string
}

export interface FilterState {
  earthquakes: boolean
  wildfires: boolean
  storms: boolean
  conflicts: boolean
  markets: boolean
  flights: boolean
  satellites: boolean
}

export const countries: Country[] = [
  {
    name: 'Ukraine', code: 'UA', flag: '\u{1F1FA}\u{1F1E6}', lat: 48.3794, lng: 31.1656,
    riskLevel: 'critical', riskScore: 94,
    weather: { temp: -2, condition: 'Overcast', humidity: 78, wind: 24 },
    disasters: [
      { type: 'Infrastructure', description: 'Power grid damage in eastern regions', date: '2026-03-04' },
      { type: 'Humanitarian', description: 'Civilian displacement ongoing', date: '2026-03-03' }
    ],
    conflictActive: true, conflictDescription: 'Active armed conflict - full scale military operations',
    goldIndicator: 2847, flightDensity: 12, wildfireDetections: 8,
    marketData: [45, 52, 48, 67, 72, 85, 91, 94, 88, 92, 87, 94],
    population: '37.0M', region: 'Eastern Europe'
  },
  {
    name: 'Syria', code: 'SY', flag: '\u{1F1F8}\u{1F1FE}', lat: 34.8021, lng: 38.9968,
    riskLevel: 'critical', riskScore: 91,
    weather: { temp: 14, condition: 'Partly Cloudy', humidity: 42, wind: 18 },
    disasters: [
      { type: 'Earthquake', description: '4.2 magnitude tremor near Aleppo', date: '2026-03-02' }
    ],
    conflictActive: true, conflictDescription: 'Ongoing civil conflict - multiple armed factions',
    goldIndicator: 2843, flightDensity: 8, wildfireDetections: 3,
    marketData: [78, 82, 75, 88, 92, 85, 89, 91, 87, 90, 88, 91],
    population: '22.1M', region: 'Middle East'
  },
  {
    name: 'Sudan', code: 'SD', flag: '\u{1F1F8}\u{1F1E9}', lat: 12.8628, lng: 30.2176,
    riskLevel: 'critical', riskScore: 89,
    weather: { temp: 36, condition: 'Clear', humidity: 22, wind: 15 },
    disasters: [
      { type: 'Humanitarian', description: 'Famine conditions in Darfur', date: '2026-03-04' }
    ],
    conflictActive: true, conflictDescription: 'Civil war between military factions',
    goldIndicator: 2845, flightDensity: 5, wildfireDetections: 14,
    marketData: [65, 70, 78, 82, 85, 79, 84, 89, 86, 88, 85, 89],
    population: '48.1M', region: 'North Africa'
  },
  {
    name: 'Yemen', code: 'YE', flag: '\u{1F1FE}\u{1F1EA}', lat: 15.5527, lng: 48.5164,
    riskLevel: 'high', riskScore: 82,
    weather: { temp: 28, condition: 'Hazy', humidity: 55, wind: 22 },
    disasters: [
      { type: 'Humanitarian', description: 'Cholera outbreak in coastal regions', date: '2026-02-28' }
    ],
    conflictActive: true, conflictDescription: 'Active insurgency and naval blockade operations',
    goldIndicator: 2841, flightDensity: 6, wildfireDetections: 1,
    marketData: [55, 60, 58, 65, 72, 68, 74, 78, 82, 79, 80, 82],
    population: '34.4M', region: 'Middle East'
  },
  {
    name: 'Myanmar', code: 'MM', flag: '\u{1F1F2}\u{1F1F2}', lat: 21.9162, lng: 95.956,
    riskLevel: 'high', riskScore: 78,
    weather: { temp: 32, condition: 'Humid', humidity: 82, wind: 8 },
    disasters: [
      { type: 'Flood', description: 'Monsoon flooding in Rakhine state', date: '2026-03-01' }
    ],
    conflictActive: true, conflictDescription: 'Military junta vs resistance forces',
    goldIndicator: 2838, flightDensity: 18, wildfireDetections: 22,
    marketData: [42, 48, 55, 52, 60, 65, 58, 72, 68, 75, 70, 78],
    population: '54.8M', region: 'Southeast Asia'
  },
  {
    name: 'Iran', code: 'IR', flag: '\u{1F1EE}\u{1F1F7}', lat: 32.4279, lng: 53.688,
    riskLevel: 'high', riskScore: 72,
    weather: { temp: 18, condition: 'Dry', humidity: 30, wind: 12 },
    disasters: [
      { type: 'Earthquake', description: '3.8 magnitude in Kerman province', date: '2026-03-03' }
    ],
    conflictActive: false,
    goldIndicator: 2850, flightDensity: 42, wildfireDetections: 2,
    marketData: [38, 42, 45, 50, 48, 55, 60, 58, 65, 62, 68, 72],
    population: '88.5M', region: 'Middle East'
  },
  {
    name: 'Russia', code: 'RU', flag: '\u{1F1F7}\u{1F1FA}', lat: 61.524, lng: 105.3188,
    riskLevel: 'high', riskScore: 75,
    weather: { temp: -15, condition: 'Snow', humidity: 85, wind: 30 },
    disasters: [
      { type: 'Wildfire', description: 'Siberian forest fires detected via satellite', date: '2026-03-02' }
    ],
    conflictActive: true, conflictDescription: 'Engaged in foreign military operations',
    goldIndicator: 2852, flightDensity: 156, wildfireDetections: 34,
    marketData: [50, 55, 58, 62, 65, 60, 68, 72, 75, 70, 73, 75],
    population: '144.1M', region: 'Eurasia'
  },
  {
    name: 'China', code: 'CN', flag: '\u{1F1E8}\u{1F1F3}', lat: 35.8617, lng: 104.1954,
    riskLevel: 'medium', riskScore: 52,
    weather: { temp: 8, condition: 'Smog', humidity: 60, wind: 10 },
    disasters: [
      { type: 'Earthquake', description: '5.1 magnitude in Sichuan province', date: '2026-03-01' }
    ],
    conflictActive: false,
    goldIndicator: 2848, flightDensity: 892, wildfireDetections: 12,
    marketData: [30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 48, 52],
    population: '1.41B', region: 'East Asia'
  },
  {
    name: 'India', code: 'IN', flag: '\u{1F1EE}\u{1F1F3}', lat: 20.5937, lng: 78.9629,
    riskLevel: 'medium', riskScore: 45,
    weather: { temp: 30, condition: 'Hot', humidity: 65, wind: 14 },
    disasters: [
      { type: 'Flood', description: 'Pre-monsoon flooding in Assam', date: '2026-03-04' }
    ],
    conflictActive: false,
    goldIndicator: 2846, flightDensity: 724, wildfireDetections: 28,
    marketData: [25, 28, 30, 32, 35, 38, 40, 42, 38, 45, 42, 45],
    population: '1.44B', region: 'South Asia'
  },
  {
    name: 'Brazil', code: 'BR', flag: '\u{1F1E7}\u{1F1F7}', lat: -14.235, lng: -51.9253,
    riskLevel: 'medium', riskScore: 42,
    weather: { temp: 28, condition: 'Tropical Storm', humidity: 88, wind: 35 },
    disasters: [
      { type: 'Wildfire', description: 'Amazon deforestation fires detected', date: '2026-03-03' },
      { type: 'Flood', description: 'Heavy rainfall flooding in Sao Paulo', date: '2026-03-02' }
    ],
    conflictActive: false,
    goldIndicator: 2840, flightDensity: 445, wildfireDetections: 156,
    marketData: [22, 25, 28, 30, 32, 35, 38, 36, 40, 38, 42, 42],
    population: '216.4M', region: 'South America'
  },
  {
    name: 'Nigeria', code: 'NG', flag: '\u{1F1F3}\u{1F1EC}', lat: 9.082, lng: 8.6753,
    riskLevel: 'medium', riskScore: 55,
    weather: { temp: 34, condition: 'Humid', humidity: 75, wind: 12 },
    disasters: [
      { type: 'Flood', description: 'Niger River flooding', date: '2026-02-28' }
    ],
    conflictActive: true, conflictDescription: 'Boko Haram insurgency in northeast',
    goldIndicator: 2842, flightDensity: 89, wildfireDetections: 18,
    marketData: [30, 35, 38, 42, 45, 48, 52, 50, 55, 52, 55, 55],
    population: '223.8M', region: 'West Africa'
  },
  {
    name: 'Turkey', code: 'TR', flag: '\u{1F1F9}\u{1F1F7}', lat: 38.9637, lng: 35.2433,
    riskLevel: 'medium', riskScore: 48,
    weather: { temp: 10, condition: 'Rainy', humidity: 72, wind: 20 },
    disasters: [
      { type: 'Earthquake', description: '4.8 magnitude near Hatay', date: '2026-03-04' }
    ],
    conflictActive: false,
    goldIndicator: 2844, flightDensity: 312, wildfireDetections: 4,
    marketData: [28, 30, 32, 35, 38, 35, 40, 42, 45, 42, 48, 48],
    population: '85.8M', region: 'Eurasia'
  },
  {
    name: 'United States', code: 'US', flag: '\u{1F1FA}\u{1F1F8}', lat: 37.0902, lng: -95.7129,
    riskLevel: 'low', riskScore: 22,
    weather: { temp: 12, condition: 'Clear', humidity: 45, wind: 16 },
    disasters: [
      { type: 'Wildfire', description: 'Brush fire in Southern California', date: '2026-03-03' }
    ],
    conflictActive: false,
    goldIndicator: 2851, flightDensity: 2847, wildfireDetections: 8,
    marketData: [12, 15, 14, 18, 16, 20, 22, 18, 22, 20, 22, 22],
    population: '339.9M', region: 'North America'
  },
  {
    name: 'United Kingdom', code: 'GB', flag: '\u{1F1EC}\u{1F1E7}', lat: 55.3781, lng: -3.436,
    riskLevel: 'low', riskScore: 18,
    weather: { temp: 6, condition: 'Rainy', humidity: 82, wind: 28 },
    disasters: [],
    conflictActive: false,
    goldIndicator: 2849, flightDensity: 1245, wildfireDetections: 0,
    marketData: [10, 12, 11, 14, 13, 16, 15, 18, 16, 18, 17, 18],
    population: '68.1M', region: 'Western Europe'
  },
  {
    name: 'Germany', code: 'DE', flag: '\u{1F1E9}\u{1F1EA}', lat: 51.1657, lng: 10.4515,
    riskLevel: 'low', riskScore: 15,
    weather: { temp: 4, condition: 'Cloudy', humidity: 70, wind: 18 },
    disasters: [],
    conflictActive: false,
    goldIndicator: 2848, flightDensity: 1567, wildfireDetections: 0,
    marketData: [8, 10, 9, 12, 11, 14, 13, 15, 14, 15, 14, 15],
    population: '84.5M', region: 'Western Europe'
  },
  {
    name: 'Japan', code: 'JP', flag: '\u{1F1EF}\u{1F1F5}', lat: 36.2048, lng: 138.2529,
    riskLevel: 'low', riskScore: 28,
    weather: { temp: 8, condition: 'Clear', humidity: 55, wind: 12 },
    disasters: [
      { type: 'Earthquake', description: '5.2 magnitude off Hokkaido coast', date: '2026-03-04' }
    ],
    conflictActive: false,
    goldIndicator: 2847, flightDensity: 1089, wildfireDetections: 1,
    marketData: [14, 16, 18, 20, 22, 24, 22, 26, 24, 28, 26, 28],
    population: '123.3M', region: 'East Asia'
  },
  {
    name: 'Australia', code: 'AU', flag: '\u{1F1E6}\u{1F1FA}', lat: -25.2744, lng: 133.7751,
    riskLevel: 'low', riskScore: 25,
    weather: { temp: 34, condition: 'Hot', humidity: 30, wind: 22 },
    disasters: [
      { type: 'Wildfire', description: 'Bushfire alert in New South Wales', date: '2026-03-04' },
      { type: 'Wildfire', description: 'Grassfire in Queensland', date: '2026-03-03' }
    ],
    conflictActive: false,
    goldIndicator: 2846, flightDensity: 467, wildfireDetections: 42,
    marketData: [12, 14, 16, 18, 20, 22, 24, 22, 26, 24, 25, 25],
    population: '26.6M', region: 'Oceania'
  },
  {
    name: 'Taiwan', code: 'TW', flag: '\u{1F1F9}\u{1F1FC}', lat: 23.6978, lng: 120.9605,
    riskLevel: 'medium', riskScore: 48,
    weather: { temp: 22, condition: 'Cloudy', humidity: 72, wind: 16 },
    disasters: [
      { type: 'Earthquake', description: '3.5 magnitude tremor near Hualien', date: '2026-03-02' }
    ],
    conflictActive: false,
    goldIndicator: 2849, flightDensity: 378, wildfireDetections: 0,
    marketData: [25, 28, 30, 35, 38, 42, 45, 48, 45, 48, 46, 48],
    population: '23.9M', region: 'East Asia'
  },
  {
    name: 'Pakistan', code: 'PK', flag: '\u{1F1F5}\u{1F1F0}', lat: 30.3753, lng: 69.3451,
    riskLevel: 'medium', riskScore: 58,
    weather: { temp: 24, condition: 'Dusty', humidity: 35, wind: 20 },
    disasters: [
      { type: 'Flood', description: 'Flash flooding in Balochistan', date: '2026-03-03' }
    ],
    conflictActive: true, conflictDescription: 'Counter-terrorism operations in border regions',
    goldIndicator: 2845, flightDensity: 198, wildfireDetections: 6,
    marketData: [32, 35, 38, 42, 45, 48, 52, 55, 58, 55, 58, 58],
    population: '240.5M', region: 'South Asia'
  },
  {
    name: 'Somalia', code: 'SO', flag: '\u{1F1F8}\u{1F1F4}', lat: 5.1521, lng: 46.1996,
    riskLevel: 'high', riskScore: 80,
    weather: { temp: 30, condition: 'Dry', humidity: 40, wind: 25 },
    disasters: [
      { type: 'Drought', description: 'Severe drought conditions persist', date: '2026-03-04' }
    ],
    conflictActive: true, conflictDescription: 'Al-Shabaab insurgency and clan conflicts',
    goldIndicator: 2840, flightDensity: 4, wildfireDetections: 7,
    marketData: [60, 65, 70, 72, 75, 78, 80, 75, 82, 78, 80, 80],
    population: '18.1M', region: 'East Africa'
  },
]

export const globalEvents: GlobalEvent[] = [
  {
    id: 'evt-001', type: 'earthquake',
    title: 'M5.2 Earthquake - Hokkaido',
    location: 'Japan', timestamp: '2026-03-05T08:42:00Z',
    severity: 'medium', lat: 43.06, lng: 141.35,
    description: 'Moderate earthquake detected off northern Japan coast. Tsunami warning briefly issued.'
  },
  {
    id: 'evt-002', type: 'conflict',
    title: 'Escalation in Eastern Ukraine',
    location: 'Ukraine', timestamp: '2026-03-05T07:15:00Z',
    severity: 'critical', lat: 48.57, lng: 37.80,
    description: 'Significant military activity detected via satellite imagery in Donetsk region.'
  },
  {
    id: 'evt-003', type: 'wildfire',
    title: 'NSW Bushfire Alert Level 3',
    location: 'Australia', timestamp: '2026-03-05T06:30:00Z',
    severity: 'high', lat: -33.87, lng: 151.21,
    description: '12,000 hectares affected. Emergency evacuation orders issued for 3 communities.'
  },
  {
    id: 'evt-004', type: 'market',
    title: 'Gold Surges Past $2,850/oz',
    location: 'Global', timestamp: '2026-03-05T05:00:00Z',
    severity: 'medium', lat: 40.71, lng: -74.01,
    description: 'Gold prices hit 6-month high amid geopolitical uncertainty and inflation concerns.'
  },
  {
    id: 'evt-005', type: 'storm',
    title: 'Tropical Cyclone Approaching Philippines',
    location: 'Philippines', timestamp: '2026-03-05T04:20:00Z',
    severity: 'high', lat: 14.60, lng: 120.98,
    description: 'Category 2 tropical cyclone expected to make landfall within 48 hours.'
  },
  {
    id: 'evt-006', type: 'earthquake',
    title: 'M4.8 Earthquake - Hatay Province',
    location: 'Turkey', timestamp: '2026-03-05T02:55:00Z',
    severity: 'medium', lat: 36.20, lng: 36.16,
    description: 'Moderate earthquake in southeastern Turkey. No immediate casualties reported.'
  },
  {
    id: 'evt-007', type: 'conflict',
    title: 'RSF Offensive in Darfur',
    location: 'Sudan', timestamp: '2026-03-04T22:40:00Z',
    severity: 'critical', lat: 13.45, lng: 25.35,
    description: 'Rapid Support Forces launched major offensive. Civilian casualties reported.'
  },
  {
    id: 'evt-008', type: 'wildfire',
    title: 'Amazon Deforestation Fires Detected',
    location: 'Brazil', timestamp: '2026-03-04T20:10:00Z',
    severity: 'high', lat: -3.47, lng: -62.22,
    description: 'VIIRS satellite detected 156 active fire spots in Amazon basin.'
  },
  {
    id: 'evt-009', type: 'storm',
    title: 'Flooding in Sao Paulo Metropolitan',
    location: 'Brazil', timestamp: '2026-03-04T18:30:00Z',
    severity: 'medium', lat: -23.55, lng: -46.63,
    description: 'Heavy rainfall causes urban flooding. Transportation disrupted.'
  },
  {
    id: 'evt-010', type: 'market',
    title: 'Oil Price Volatility Spike',
    location: 'Global', timestamp: '2026-03-04T16:00:00Z',
    severity: 'medium', lat: 25.27, lng: 55.30,
    description: 'Brent crude fluctuates 4% in single session amid Middle East tensions.'
  },
  {
    id: 'evt-011', type: 'wildfire',
    title: 'Siberian Forest Fire Expansion',
    location: 'Russia', timestamp: '2026-03-04T14:20:00Z',
    severity: 'high', lat: 56.50, lng: 84.97,
    description: 'Satellite imagery shows fire front expanding to 8,500 hectares.'
  },
  {
    id: 'evt-012', type: 'earthquake',
    title: 'M5.1 Earthquake - Sichuan',
    location: 'China', timestamp: '2026-03-04T10:45:00Z',
    severity: 'medium', lat: 30.57, lng: 104.07,
    description: 'Moderate earthquake in populous Sichuan province. Minor structural damage.'
  },
]

export const globalStats = {
  totalEvents: 247,
  criticalAlerts: 12,
  activeConflicts: 8,
  highRiskCountries: 7,
  satelliteFeeds: 14,
  flightsTracked: 12847,
  wildfireDetections: 342,
  goldPrice: 2851.40,
  goldChange: +1.8,
  oilPrice: 82.65,
  oilChange: -0.4,
}

export const eventTypeConfig: Record<string, { color: string; label: string }> = {
  earthquake: { color: '#FFC107', label: 'SEISMIC' },
  wildfire: { color: '#FF3B3B', label: 'FIRE' },
  storm: { color: '#00E5FF', label: 'STORM' },
  conflict: { color: '#FF3B3B', label: 'CONFLICT' },
  market: { color: '#FFD700', label: 'MARKET' },
}

export const severityConfig: Record<string, { color: string; bg: string }> = {
  low: { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.15)' },
  medium: { color: '#FFC107', bg: 'rgba(255, 193, 7, 0.15)' },
  high: { color: '#FF8C00', bg: 'rgba(255, 140, 0, 0.15)' },
  critical: { color: '#FF3B3B', bg: 'rgba(255, 59, 59, 0.15)' },
}

export const riskLevelConfig: Record<string, { color: string; glow: string; label: string }> = {
  low: { color: '#00FF88', glow: '0 0 12px rgba(0, 255, 136, 0.4)', label: 'LOW' },
  medium: { color: '#FFC107', glow: '0 0 12px rgba(255, 193, 7, 0.4)', label: 'MEDIUM' },
  high: { color: '#FF8C00', glow: '0 0 12px rgba(255, 140, 0, 0.4)', label: 'HIGH' },
  critical: { color: '#FF3B3B', glow: '0 0 12px rgba(255, 59, 59, 0.4)', label: 'CRITICAL' },
}
