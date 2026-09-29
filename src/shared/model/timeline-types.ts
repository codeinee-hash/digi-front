export const TIMESTAMPS = [
  '06:00',
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '22:00',
] as const

export type TimePoint = (typeof TIMESTAMPS)[number]

export interface TimeSeriesPoint {
  time: TimePoint
  temperature: number
  wind: number
  insolation: number
}

export const TIMELINE_SERIES: TimeSeriesPoint[] = [
  { time: '06:00', temperature: 16.2, wind: 2.8, insolation: 85 },
  { time: '08:00', temperature: 20.4, wind: 3.5, insolation: 340 },
  { time: '10:00', temperature: 25.1, wind: 5.2, insolation: 720 },
  { time: '12:00', temperature: 29.8, wind: 6.8, insolation: 960 },
  { time: '14:00', temperature: 32.5, wind: 8.4, insolation: 910 },
  { time: '16:00', temperature: 29.3, wind: 9.1, insolation: 650 },
  { time: '18:00', temperature: 26.0, wind: 6.5, insolation: 180 },
  { time: '20:00', temperature: 22.4, wind: 4.2, insolation: 0 },
  { time: '22:00', temperature: 18.7, wind: 3.0, insolation: 0 },
]

export interface StationTelemetry {
  id: string
  name: string
  lat: number
  lon: number
  altitude: number
  status: 'online' | 'tracking' | 'calibrating'
  signalStrength: number
  bandwidthMbps: number
  activeSatellite: string
}

export const BISHKEK_TELEPORT_STATION: StationTelemetry = {
  id: 'digi-teleport-01',
  name: 'DiGi SatCom Ground Station Bishkek',
  lat: 42.8746,
  lon: 74.5698,
  altitude: 820,
  status: 'tracking',
  signalStrength: 94.2,
  bandwidthMbps: 1250,
  activeSatellite: 'KAZSAT-3 / GEO-58.5E',
}
