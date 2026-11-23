"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { canRun3D } from "@/lib/gpu";
import type { LatLng } from "@/lib/globalRoutes";

/* ------------------------------------------------------------------ */
/*  Rotating dotted globe (COBE, MIT, ~5 KB) with an SVG layer on top: */
/*  glowing great-circle routes, moving plane icons and pulsing        */
/*  destination markers. The SVG uses COBE's own projection, so the    */
/*  routes stay glued to the globe while it turns or is dragged.       */
/*  - loads only when scrolled near, pauses when off screen            */
/*  - still image for weak devices; no motion for reduced-motion users */
/* ------------------------------------------------------------------ */

export type GlobeRoute = { id: string; to: LatLng; label?: string };
type Props = {
  origin: LatLng;
  routes: GlobeRoute[];
  /** still image shown before load and on devices without good 3D */
  fallbackSrc: string;
  fallbackAlt: string;
  className?: string;
};

type V3 = [number, number, number];
const R = 0.8; // COBE globe radius
const ELEV = 0.012; // markers and route ends sit just above the surface
const STEPS = 56; // points per route
const TRAIL = 0.24; // trail length as a share of the route
const SPEED = 0.07; // routes per second
const SCALE = 0.84; // globe size inside the square, leaves room for the arcs

const vec = ([lat, lng]: LatLng): V3 => {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
};

/* Same maths as COBE's marker projection: returns 0..1 canvas coords and whether the point is in front */
function project(p: V3, phi: number, theta: number) {
  const ct = Math.cos(theta), cp = Math.cos(phi), st = Math.sin(theta), sp = Math.sin(phi);
  const x = cp * p[0] + sp * p[2];
  const y = sp * st * p[0] + ct * p[1] - cp * st * p[2];
  const z = -sp * ct * p[0] + st * p[1] + cp * ct * p[2];
  return { x: (x * SCALE + 1) / 2, y: (-y * SCALE + 1) / 2, front: z >= 0 || x * x + y * y >= R * R, z, r: Math.hypot(x, y) };
}

/* Points along the great circle, lifted into an arc that is higher for longer routes */
function arcPoints(a: V3, b: V3): V3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const ang = Math.acos(dot);
  const s = Math.sin(ang) || 1;
  const lift = Math.min(0.2, 0.04 + 0.09 * ang);
  const pts: V3[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const k1 = Math.sin((1 - t) * ang) / s, k2 = Math.sin(t * ang) / s;
    const r = R + ELEV + lift * Math.sin(Math.PI * t);
    pts.push([(a[0] * k1 + b[0] * k2) * r, (a[1] * k1 + b[1] * k2) * r, (a[2] * k1 + b[2] * k2) * r]);
  }
  return pts;
}

/* Fade near the globe's edge instead of popping on/off (stops the blinking on small screens).
   Points in front fade in with depth; points behind but lifted past the rim fade in as they clear it. */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const fade = (q: { z: number; r: number }) => Math.max(clamp01((q.z + 0.04) / 0.3), clamp01((q.r - R) / 0.04));

const PLANE = "M0,-7 L1.6,-2 L7,1.5 L7,3 L1.6,1.2 L1.2,5 L3,6.4 L3,7.4 L0,6.6 L-3,7.4 L-3,6.4 L-1.2,5 L-1.6,1.2 L-7,3 L-7,1.5 L-1.6,-2 Z";

export default function RouteGlobe({ origin, routes, fallbackSrc, fallbackAlt, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !canRun3D()) return;
    let stop = () => {};
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        start().then((s) => (stop = s));
      },
      { rootMargin: "300px" },
    );
    io.observe(el);

    async function start() {
      const { default: createGlobe } = await import("cobe");
      const box = host.current!;
      const layer = svg.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.innerWidth < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width:100%;height:100%;display:block;opacity:0;transition:opacity .8s ease";
      box.appendChild(canvas);
      let size = box.clientWidth;

      const o = vec(origin);
      const ends = routes.map((r) => vec(r.to));
      const paths = ends.map((b) => arcPoints(o, b));
      const lift = (v: V3): V3 => [v[0] * (R + ELEV), v[1] * (R + ELEV), v[2] * (R + ELEV)];

      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size,
        height: size,
        phi: 0,
        theta: 0.32,
        dark: 1,
        diffuse: 1.1,
        mapSamples: small ? 11000 : 16000,
        mapBrightness: 9,
        mapBaseBrightness: 0.06,
        baseColor: [0.32, 0.12, 0.15],
        markerColor: [1, 0.23, 0.33],
        glowColor: [0.78, 0.06, 0.18],
        markers: [{ location: origin, size: 0.06 }, ...routes.map((r) => ({ location: r.to, size: 0.028 }))],
        markerElevation: ELEV,
        scale: SCALE,
      });
      requestAnimationFrame(() => (canvas.style.opacity = "1"));

      /* SVG elements, created once and updated every frame */
      const NS = "http://www.w3.org/2000/svg";
      const mk = (tag: string, attrs: Record<string, string>, parent: Element = layer) => {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        parent.appendChild(n);
        return n;
      };
      const bases = paths.map(() => mk("path", { class: "rg-base" }));
      const trails = paths.map(() => mk("path", { class: "rg-trail" }));
      const planes = paths.map(() => {
        const g = mk("g", { class: "rg-plane" });
        mk("path", { d: PLANE }, g);
        return g;
      });
      const pins = ends.map((_, i) => {
        const g = mk("g", { class: "rg-pin" });
        // stagger the pulses so nearby cities don't flash in sync
        (mk("circle", { r: "9", class: "rg-pulse" }, g) as SVGCircleElement).style.animationDelay = `${(-(i * 0.61) % 2.4).toFixed(2)}s`;
        mk("circle", { r: "3.2", class: "rg-dot" }, g);
        return g;
      });
      const home = mk("g", { class: "rg-pin rg-home" });
      mk("circle", { r: "14", class: "rg-pulse" }, home);
      mk("circle", { r: "5", class: "rg-dot" }, home);

      /* rotation + drag */
      let phi = -0.75; // North Atlantic facing the viewer: Canada on the left, Europe on the right
      const theta = 0.32;
      let drag: { x: number; phi: number } | null = null;
      let vel = 0;
      const down = (e: PointerEvent) => {
        drag = { x: e.clientX, phi };
        vel = 0;
        box.setPointerCapture(e.pointerId);
        box.dataset.dragging = "";
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const next = drag.phi + ((e.clientX - drag.x) / size) * Math.PI;
        vel = next - phi;
        phi = next;
      };
      const up = () => {
        drag = null;
        delete box.dataset.dragging;
      };
      box.addEventListener("pointerdown", down);
      box.addEventListener("pointermove", move);
      box.addEventListener("pointerup", up);
      box.addEventListener("pointercancel", up);

      const ro = new ResizeObserver(() => {
        size = box.clientWidth;
        globe.update({ width: size, height: size });
      });
      ro.observe(box);

      const P = (v: V3) => project(v, phi, theta);
      const at = (q: { x: number; y: number }) => `${(q.x * 1000).toFixed(1)},${(q.y * 1000).toFixed(1)}`;
      const line = (pts: V3[], from: number, to: number) => {
        let d = "", pen = false;
        for (let i = Math.max(0, Math.floor(from)); i <= Math.min(STEPS, Math.ceil(to)); i++) {
          const q = P(pts[i]);
          if (!q.front) { pen = false; continue; }
          d += (pen ? "L" : "M") + at(q);
          pen = true;
        }
        return d;
      };

      let raf = 0, last = performance.now(), clock = 0, visible = true;
      const frame = (now: number) => {
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); // rAF time can be slightly earlier than performance.now()
        last = now;
        if (!reduce) {
          clock += dt;
          if (!drag) {
            phi += 0.06 * dt + vel;
            vel *= 0.92;
          }
        }
        globe.update({ phi, theta });

        paths.forEach((pts, i) => {
          bases[i].setAttribute("d", line(pts, 0, STEPS));
          const cycle = 1 + TRAIL + 0.35;
          const head = reduce ? 0.68 : ((clock * SPEED + i / paths.length) * 1.0) % cycle;
          const h = Math.min(head, 1);
          const tail = Math.max(0, head - TRAIL);
          trails[i].setAttribute("d", tail < 1 ? line(pts, tail * STEPS, h * STEPS) : "");
          const plane = planes[i];
          if (head <= 1) {
            const j = Math.min(STEPS - 1, Math.floor(head * STEPS));
            const a = P(pts[j]), b = P(pts[j + 1]);
            if (a.front && b.front) {
              const ang = (Math.atan2((b.y - a.y), (b.x - a.x)) * 180) / Math.PI + 90;
              const sc = 1.15 + 0.45 * Math.max(0, a.z);
              plane.setAttribute("transform", `translate(${at(a)}) rotate(${ang.toFixed(1)}) scale(${sc.toFixed(2)})`);
              plane.style.opacity = fade(a).toFixed(2);
            } else plane.style.opacity = "0";
          } else plane.style.opacity = "0";
          const e = P(lift(ends[i]));
          pins[i].setAttribute("transform", `translate(${at(e)})`);
          (pins[i] as SVGGElement).style.opacity = fade(e).toFixed(2);
        });
        const hq = P(lift(o));
        home.setAttribute("transform", `translate(${at(hq)})`);
        (home as SVGGElement).style.opacity = fade(hq).toFixed(2);

        if (visible) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      setLive(true);

      /* pause when scrolled away or tab hidden */
      const vis = new IntersectionObserver((en) => {
        const on = en[0].isIntersecting && !document.hidden;
        if (on && !visible) {
          visible = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!on) {
          visible = false;
          cancelAnimationFrame(raf);
        }
      });
      vis.observe(box);

      return () => {
        cancelAnimationFrame(raf);
        vis.disconnect();
        ro.disconnect();
        box.removeEventListener("pointerdown", down);
        box.removeEventListener("pointermove", move);
        box.removeEventListener("pointerup", up);
        box.removeEventListener("pointercancel", up);
        globe.destroy();
        box.innerHTML = "";
        layer.innerHTML = "";
      };
    }

    return () => {
      io.disconnect();
      stop();
    };
  }, [origin, routes]);

  return (
    <div ref={wrap} className={`relative aspect-square w-full ${className}`}>
      {/* still image until the live globe is ready, and for devices without good 3D */}
      <Image src={fallbackSrc} alt={fallbackAlt} fill sizes="(min-width: 1024px) 560px, 92vw" className={`object-contain transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`} />
      <div ref={host} className="absolute inset-0 cursor-grab touch-pan-y data-dragging:cursor-grabbing" aria-hidden="true" />
      <svg ref={svg} viewBox="0 0 1000 1000" className="rg-layer pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id="rg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
