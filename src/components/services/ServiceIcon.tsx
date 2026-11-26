import {
  Activity, ArrowUpCircle, BatteryCharging, CalendarCheck, Cable, Circle, Cog, Disc3, Droplets, Fan, FileSearch, Flame,
  Footprints, Gauge, Monitor, MonitorSmartphone, MoveHorizontal, OctagonPause, Plug, RotateCw, Save, ScanSearch, ShieldCheck,
  Siren, Sparkles, Thermometer, Unplug, Workflow, Wrench, Zap,
} from "lucide-react";

const map: Record<string, React.ElementType> = {
  Activity, ArrowUpCircle, BatteryCharging, CalendarCheck, Cable, Circle, Cog, Disc3, Droplets, Fan, FileSearch, Flame,
  Footprints, Gauge, Monitor, MonitorSmartphone, MoveHorizontal, OctagonPause, Plug, RotateCw, Save, ScanSearch, ShieldCheck,
  Siren, Sparkles, Thermometer, Unplug, Workflow, Zap,
};

/* Coloured icon tile for services without a product photo */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- callers still pass a colour; tiles are now IAR red
export default function ServiceIcon({ name, color, size = 48, className = "" }: { name?: string; color: string; size?: number; className?: string }) {
  const I = (name && map[name]) || Wrench;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[28%] text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/20 ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(145deg, #C8102E, #131316)` }}
    >
      <I size={Math.round(size * 0.46)} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
