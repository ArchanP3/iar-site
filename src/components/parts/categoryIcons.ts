import type { LucideIcon } from "lucide-react";
import { Archive, Boxes, CircuitBoard, Cog, Cpu, Droplets, Gauge, Monitor, PlugZap, Radar, Settings2, ShieldCheck, Zap } from "lucide-react";

/* One icon per shop category (src/lib/parts/categories.ts), used by the shop page, filters and the Shop Parts menu. */
const icons: Record<string, LucideIcon> = {
  "servo-drives": Zap,
  "servo-motors": Cog,
  encoders: Gauge,
  hmis: Monitor,
  plcs: Cpu,
  "power-supplies": PlugZap,
  "cnc-controls": CircuitBoard,
  legacy: Archive,
  sensors: Radar,
  safety: ShieldCheck,
  gearboxes: Settings2,
  "pneumatics-hydraulics": Droplets,
  other: Boxes,
};

export const categoryIcon = (slug: string): LucideIcon => icons[slug] ?? Boxes;
