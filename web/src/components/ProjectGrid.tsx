"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";

/**
 * Project cards with the reference video's entrance:
 *  1. every card shoots in from deep space onto a 3D carousel ring,
 *  2. the ring spins fast and continuously, then slows,
 *  3. the cards flatten out of the ring into their row / grid.
 * Plays when the grid scrolls into view (`trigger="view"`) or right away (`trigger="load"`).
 * An optional `more` card (e.g. "Show all projects") joins the ring and ends last in the row.
 */

const T_IN = 0.7;    // seconds: fly in from deep space onto the ring
const T_SPIN = 1.8;  // seconds: fast spin, slowing down
const T_OUT = 1.1;   // seconds: ring → final place
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export default function ProjectGrid({
  projects,
  variant = "overview",
  trigger = "view",
  more,
  duration = T_IN + T_SPIN + T_OUT,
}: {
  projects: Project[];
  variant?: "overview" | "full";
  trigger?: "view" | "load";
  more?: { href: string; count: number };
  /** Total seconds for fly-in → spin → settle. Shorter just plays everything faster (same ~2.8 turns). */
  duration?: number;
}) {
  const grid = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<"pending" | "flying" | "done">("pending");

  useEffect(() => {
    const el = grid.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const fly = () => {
      if (reduced) { setState("done"); return; }
      const cards = [...el.children] as HTMLElement[];
      const n = cards.length;
      // ring centred on the visible part of the grid; offsets are measured from each card's final spot
      const g = el.getBoundingClientRect();
      const gcx = g.left + g.width / 2;
      const gcy = (Math.max(g.top, 0) + Math.min(g.bottom, innerHeight)) / 2;
      const off = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return [r.left + r.width / 2 - gcx, r.top + r.height / 2 - gcy];
      });
      const R = Math.min(Math.max(innerWidth * 0.26, 200), 520) * (n > 6 ? 1.3 : 1);
      const start = cards.map(() => [(Math.random() * 2 - 1) * innerWidth * 0.5, (Math.random() * 2 - 1) * innerHeight * 0.4]);
      // angle of the ring: fast at first, easing down (integral of 12·e^(-0.9t) + 1.4)
      const spin = (t: number) => (12 / 0.9) * (1 - Math.exp(-0.9 * t)) + 1.4 * t;
      // play the whole sequence on a sped-up clock so it fits `duration` seconds
      const speed = (T_IN + T_SPIN + T_OUT) / duration;

      setState("flying");
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = ((now - t0) / 1000) * speed;
        const a = spin(t);
        cards.forEach((card, i) => {
          let phi = (i / n) * Math.PI * 2 + a;
          const ringX = R * Math.sin(phi), ringZ = R * (Math.cos(phi) - 1);
          const front = (Math.cos(phi) + 1) / 2;           // 1 = facing the viewer
          let x = ringX - off[i]![0]!, y = -off[i]![1]!, z = ringZ, s = 0.8, op = 0.35 + 0.65 * front;
          if (t < T_IN) {
            const k = ease(t / T_IN);
            x = lerp(start[i]![0]! - off[i]![0]!, x, k);
            y = lerp(start[i]![1]! - off[i]![1]!, y, k);
            z = lerp(-2600, z, k);
            s = lerp(0.3, s, k);
            op *= k;
          } else if (t > T_IN + T_SPIN) {
            const k = ease(Math.min(1, (t - T_IN - T_SPIN) / T_OUT));
            phi = Math.atan2(Math.sin(phi), Math.cos(phi)); // unwind to the nearest turn so it settles flat
            x = lerp(x, 0, k); y = lerp(y, 0, k); z = lerp(z, 0, k); s = lerp(s, 1, k); op = lerp(op, 1, k);
            phi = lerp(phi, 0, k);
          }
          card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${phi.toFixed(4)}rad) scale(${s.toFixed(3)})`;
          card.style.opacity = op.toFixed(3);
          card.style.zIndex = String(Math.round(front * 100));
        });
        if (t < T_IN + T_SPIN + T_OUT) raf = requestAnimationFrame(frame);
        else {
          cards.forEach((c) => { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; });
          setState("done");
        }
      };
      raf = requestAnimationFrame(frame);
    };

    if (trigger === "load") {
      const t = window.setTimeout(fly, 350);
      return () => { window.clearTimeout(t); cancelAnimationFrame(raf); };
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { io.disconnect(); fly(); } },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [trigger, duration]);

  return (
    <ul ref={grid} className={`proj-grid proj-${variant} is-${state}`}>
      {projects.map((p, i) => (
        <li key={p.slug} className="proj-card">
          <a
            className="proj-art"
            href={p.live ?? p.code}
            target="_blank"
            rel="noreferrer"
            aria-label={`${p.title} — open ${p.live ? "live site" : "code"}`}
          >
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" loading="eager" decoding="async" /> /* eager: cards start far off-screen during the spin, which would stall lazy loading */
            ) : (
              <span className={`proj-tile tone-${p.tone ?? "iris"}`} aria-hidden="true">
                <b>{p.title.split(" ").map((w) => w[0]).join("").slice(0, 2)}</b>
                <i>{p.stack.slice(0, 3).join(" · ")}</i>
              </span>
            )}
            {p.contribution && <span className="proj-flag">Open-source contribution</span>}
          </a>
          <div className="proj-meta">
            <span className="proj-index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{p.title}</h3>
            <p>{variant === "full" ? p.details : p.summary}</p>
            {variant === "full" && p.highlights && (
              <ul className="proj-highlights">
                {p.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            )}
            <p className="proj-stack">{p.stack.join(" · ")}</p>
            <div className="proj-links">
              {p.live && <a href={p.live} target="_blank" rel="noreferrer">Live ↗</a>}
              {p.code && <a href={p.code} target="_blank" rel="noreferrer">Code ↗</a>}
            </div>
          </div>
        </li>
      ))}

      {more && (
        <li className="proj-card proj-more">
          <Link className="proj-art" href={more.href} aria-label={`Show all projects (${more.count} more)`}>
            <span className="proj-tile tone-iris" aria-hidden="true">
              <b>+{more.count}</b>
              <i>more projects</i>
            </span>
          </Link>
          <div className="proj-meta">
            <span className="proj-index">{String(projects.length + 1).padStart(2, "0")}</span>
            <h3>Show more</h3>
            <p>Spring Boot, C++, React and AI builds, each with live links and code.</p>
            <div className="proj-links">
              <Link href={more.href}>View all projects →</Link>
            </div>
          </div>
        </li>
      )}
    </ul>
  );
}
