import { BatteryCharging, Gauge, PlugZap, Route, Weight } from 'lucide-react'

const ICONS = {
  'Jarak Tempuh': Route,
  'Kecepatan Max': Gauge,
  'Kapasitas Baterai': BatteryCharging,
  'Beban Max': Weight,
  'Durasi Charger': PlugZap,
}

export default function SpecIcon({ name, className = 'size-5' }) {
  const Icon = ICONS[name] ?? Gauge
  return <Icon className={className} aria-hidden="true" />
}
