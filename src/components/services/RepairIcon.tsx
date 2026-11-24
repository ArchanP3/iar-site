import {
  BadgeCheck, BadgeDollarSign, BatteryCharging, Bot, CircuitBoard, ClipboardCheck, Cpu, Crosshair, Droplets, Fan, Flame,
  Gamepad2, History, Keyboard, MapPin, MonitorSmartphone, Network, PlugZap, RefreshCw, Server, Settings2, ShieldCheck,
  Sun, Tag, Thermometer, Truck, Zap, type LucideIcon,
} from "lucide-react";

/* Icon for a "What we repair on a …" card, picked from the card title so the picture matches the words.
   Motor parts (bearings, brakes, windings, encoders, shafts, connectors) use drawn icons in the same
   line style as the lucide set; everything else uses lucide. */

type P = { size?: number; className?: string };
const svg = (size: number, className: string | undefined, children: React.ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{children}</svg>
);

/** Ball bearing: outer and inner race with balls between. */
const Bearing = ({ size = 18, className }: P) => svg(size, className, <>
  <circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="3.2" />
  {[0, 60, 120, 180, 240, 300].map((a) => {
    const r = (a * Math.PI) / 180;
    return <circle key={a} cx={12 + 6.35 * Math.cos(r)} cy={12 + 6.35 * Math.sin(r)} r="1.2" />;
  })}
</>);

/** Holding brake: disc with a caliper clamping it. */
const Brake = ({ size = 18, className }: P) => svg(size, className, <>
  <circle cx="10" cy="13" r="8" /><circle cx="10" cy="13" r="2.2" />
  <path d="M15.5 3.5h4a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-4" />
  <path d="M15.5 3.5v9" />
</>);

/** Winding: copper coil around a core. */
const Coil = ({ size = 18, className }: P) => svg(size, className, <>
  <path d="M2 18h3.2" /><path d="M18.8 18h3.2" />
  <ellipse cx="7.2" cy="12" rx="2.2" ry="6" />
  <ellipse cx="12" cy="12" rx="2.2" ry="6" />
  <ellipse cx="16.8" cy="12" rx="2.2" ry="6" />
</>);

/** Encoder: slotted code disc on a shaft. */
const Encoder = ({ size = 18, className }: P) => svg(size, className, <>
  <circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="2" />
  {Array.from({ length: 12 }, (_, i) => {
    const r = (i * 30 * Math.PI) / 180;
    return <path key={i} d={`M${12 + 5.4 * Math.cos(r)} ${12 + 5.4 * Math.sin(r)}L${12 + 7.6 * Math.cos(r)} ${12 + 7.6 * Math.sin(r)}`} />;
  })}
</>);

/** Shaft with a keyway, coming out of a flange. */
const Shaft = ({ size = 18, className }: P) => svg(size, className, <>
  <rect x="2" y="4" width="5.5" height="16" rx="1.2" />
  <path d="M7.5 8.5h12.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H7.5" />
  <rect x="12" y="8.5" width="6" height="2.6" rx=".6" />
</>);

/** Round motor connector with pins. */
const Connector = ({ size = 18, className }: P) => svg(size, className, <>
  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" />
  <circle cx="12" cy="9.6" r=".6" fill="currentColor" /><circle cx="9.7" cy="13.2" r=".6" fill="currentColor" />
  <circle cx="14.3" cy="13.2" r=".6" fill="currentColor" /><path d="M12 1.5v1.5" />
</>);

type Rule = [RegExp, LucideIcon | ((p: P) => React.ReactElement)];
const RULES: Rule[] = [
  [/bearing/i, Bearing],
  [/brake/i, Brake],
  [/winding|armature|commutators? & brushes/i, Coil],
  [/commutation alignment/i, Crosshair],
  [/encoder|resolver|feedback/i, Encoder],
  [/shaft|keyway|housing/i, Shaft],
  [/connector|cable|harness/i, Connector],
  [/igbt|power stage|power & driver|power boards/i, Zap],
  [/capacitor|dc bus/i, BatteryCharging],
  [/supply|switch-mode|rectifier|pre-charge/i, PlugZap],
  [/fan|cooling/i, Fan],
  [/sensing/i, Thermometer],
  [/communication|serial|interface|i\/o/i, Network],
  [/backlight/i, Sun],
  [/touchscreen|lcd|display|operator panel|monitor/i, MonitorSmartphone],
  [/keypad/i, Keyboard],
  [/teach pendant/i, Gamepad2],
  [/robot/i, Bot],
  [/spindle/i, Settings2],
  [/safety|protection/i, ShieldCheck],
  [/regenerative/i, RefreshCw],
  [/contamination/i, Droplets],
  [/burnt/i, Flame],
  [/obsolete/i, History],
  [/backplane|rack/i, Server],
  [/cnc/i, Settings2],
  [/cpu|control|regulator|logic|memory|controller|cards?\b/i, Cpu],
  [/same part/i, Tag],
  [/price/i, BadgeDollarSign],
  [/ships/i, Truck],
  [/tested/i, BadgeCheck],
  [/condition/i, ClipboardCheck],
  [/usa|across/i, MapPin],
];

export default function RepairIcon({ title, size = 18, className }: { title: string; size?: number; className?: string }) {
  const I = RULES.find(([re]) => re.test(title))?.[1] ?? CircuitBoard;
  return <I size={size} className={className} aria-hidden="true" />;
}
