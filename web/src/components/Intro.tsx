"use client";

import { useEffect, useRef, useState } from "react";
import { SEEN_KEY } from "@/lib/intro";

/**
 * Opening sequence, played once per browser session:
 * 1. a counter climbs to 100% while a jagged crack draws down a black, star-flecked screen;
 * 2. the screen tears apart along the crack (the counter splits with it);
 * 3. "Laxman Sirvi." writes itself in outline, fills, holds, then fades into the site.
 * While it runs, <html data-intro="playing"> holds back the hero's entrance animations.
 */


/** Faint outlined triangles on pure black, drawn once so both torn halves share the same sky. */
function skyURL(w: number, h: number) {
  const c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = w * dpr; c.height = h * dpr;
  const x = c.getContext("2d")!; x.scale(dpr, dpr);
  x.fillStyle = "#000"; x.fillRect(0, 0, w, h);
  const cols = ["#8052ff", "#ffb829", "#15846e", "#a98bff", "#4f7bff"];
  for (let i = 0, n = Math.round((w * h) / 9000); i < n; i++) {
    const s = 2 + Math.random() * (Math.random() < 0.1 ? 9 : 4);
    x.save(); x.translate(Math.random() * w, Math.random() * h); x.rotate(Math.random() * 6.28);
    x.strokeStyle = cols[i % cols.length]; x.globalAlpha = 0.1 + Math.random() * 0.22; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, -s); x.lineTo(s * 0.87, s * 0.5); x.lineTo(-s * 0.87, s * 0.5); x.closePath(); x.stroke();
    x.restore();
  }
  return `url(${c.toDataURL("image/png")})`;
}

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const tearRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // The inline script in <head> already set data-intro before paint; "done" means skip.
    if (gone || !root.current || document.documentElement.dataset.intro === "done") return;
    const el = root.current, tear = tearRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let W = 0, H = 0, len = 0, v = 0, finished = false;
    let strokes: SVGPathElement[] = [], counters: HTMLElement[] = [];

    const build = () => {
      W = innerWidth; H = innerHeight;
      const segs = 9 + Math.round(Math.random() * 3), pts: [number, number][] = [];
      for (let i = 0; i <= segs; i++) pts.push([W / 2 + (i === 0 ? 0 : (i % 2 ? 1 : -1) * (14 + Math.random() * 34)), (i / segs) * H]);
      pts[0][1] = -4; pts[segs][1] = H + 4;
      const poly = pts.map(([x, y]) => `${x}px ${y}px`).join(",");
      const d = "M" + pts.map((p) => p.join(" ")).join(" L");
      const bg = skyURL(W, H);
      tear.innerHTML = "";
      for (const sideName of ["left", "right"] as const) {
        const half = document.createElement("div");
        half.className = `tear-half ${sideName}`;
        half.style.clipPath = sideName === "left"
          ? `polygon(-10px -10px, ${poly}, -10px ${H + 10}px)`
          : `polygon(${W + 10}px -10px, ${poly}, ${W + 10}px ${H + 10}px)`;
        half.innerHTML = `
          <div class="tear-sky"></div>
          <svg class="tear-crack" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
            <defs><linearGradient id="tearGrad-${sideName}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#8052ff"/><stop offset=".55" stop-color="#ffb829"/><stop offset="1" stop-color="#15846e"/>
            </linearGradient></defs>
            <path class="edge" stroke="url(#tearGrad-${sideName})" d="${d}"/>
            <path class="line" d="${d}"/>
          </svg>
          <div class="tear-counter">
            <svg viewBox="0 0 132 132">
              <circle class="outer" cx="66" cy="66" r="60"/>
              <circle class="inner" cx="66" cy="66" r="48"/>
            </svg>
            <b>0%</b>
          </div>`;
        (half.querySelector(".tear-sky") as HTMLElement).style.backgroundImage = bg;
        tear.appendChild(half);
      }
      strokes = [...tear.querySelectorAll<SVGPathElement>(".line,.edge")];
      counters = [...tear.querySelectorAll<HTMLElement>(".tear-counter b")];
      len = strokes[0].getTotalLength();
      strokes.forEach((s) => { s.style.strokeDasharray = `${len}`; });
    };

    const setProgress = (p: number) => {
      counters.forEach((c) => (c.textContent = `${p}%`));
      strokes.forEach((s) => (s.style.strokeDashoffset = `${len * (1 - p / 100)}`));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
      el.classList.add("out");
      document.documentElement.dataset.intro = "done";
      window.dispatchEvent(new Event("intro:done"));
      later(() => setGone(true), 800);
    };

    const step = () => {
      v = Math.min(100, v + (v > 80 && v < 90 ? 1 : 2 + Math.floor(Math.random() * 7)));
      setProgress(v);
      if (v < 100) return later(step, reduced ? 10 : v > 84 && v < 90 ? 160 : 45 + Math.random() * 70);
      later(() => {
        el.classList.add("snap");                // crack glows, screen jolts
        later(() => el.classList.add("open"), 320); // halves tear apart, name starts writing
        later(finish, reduced ? 900 : 4000);
      }, 380);
    };

    build();
    later(step, 250);

    const onResize = () => { if (!el.classList.contains("snap")) { build(); setProgress(v); } };
    const skip = (e: KeyboardEvent | MouseEvent) => { if (e instanceof MouseEvent || e.key === "Escape" || e.key === "Enter") finish(); };
    addEventListener("resize", onResize);
    addEventListener("keydown", skip);
    el.addEventListener("click", skip);
    return () => {
      timers.forEach(clearTimeout);
      removeEventListener("resize", onResize);
      removeEventListener("keydown", skip);
      el.removeEventListener("click", skip);
    };
  }, [gone]);

  if (gone) return null;
  return (
    <div ref={root} className="intro" role="presentation">
      <div className="intro-name">
        <svg viewBox="0 0 1000 170" role="img" aria-label="Laxman Sirvi">
          <text x="500" y="125" textAnchor="middle">
            Laxman Sirvi<tspan className="dot">.</tspan>
          </text>
        </svg>
      </div>
      <div ref={tearRef} className="intro-tear" aria-hidden="true" />
      <span className="intro-skip">Click to skip</span>
    </div>
  );
}
