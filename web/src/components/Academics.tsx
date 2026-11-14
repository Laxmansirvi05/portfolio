"use client";

import { useEffect, useRef } from "react";

/**
 * Academics: a vertical timeline. A glowing line draws itself as the visitor scrolls; when its tip
 * reaches an entry's dot, the dot pops (burst + ripple), then that entry's details reveal and its
 * score counts up from zero. Entries stay hidden until the line arrives.
 */

type Entry = {
  years: string;
  status: string;
  school: string;
  degree: string;
  place: string;
  score: { value: number; decimals: number; suffix?: string; label: string };
  notes?: string[];
};

const ENTRIES: Entry[] = [
  {
    years: "2025 — 2029",
    status: "Current",
    school: "Geethanjali College of Engineering and Technology",
    degree: "B.Tech, Computer Science and Engineering (AI & ML)",
    place: "Keesara, Hyderabad, Telangana",
    score: { value: 9.25, decimals: 2, suffix: "/10", label: "CGPA" },
    notes: ["Second year", "AI & ML specialisation"],
  },
  {
    years: "2025 — 2026",
    status: "Foundation completed",
    school: "Indian Institute of Technology Madras",
    degree: "BS in Data Science and Applications: Foundation level (Programming & Data Science)",
    place: "Online degree, Chennai, Tamil Nadu",
    score: { value: 7.13, decimals: 2, suffix: "/10", label: "CGPA" },
    notes: ["Foundation level completed", "BS paused"],
  },
  {
    years: "2023 — 2025",
    status: "Academic excellence",
    school: "Gatik Junior College",
    degree: "Intermediate: MPC (Mathematics, Physics, Chemistry)",
    place: "Tarnaka, Hyderabad, Telangana",
    score: { value: 96.5, decimals: 1, suffix: "%", label: "Score" },
    notes: ["Academic Excellence Award", "Social Media Club volunteer"],
  },
  {
    years: "Until 2023",
    status: "Class topper",
    school: "St. Anthony's Grammar High School",
    degree: "Secondary School Certificate (Grade 10)",
    place: "HMT Nagar, Nacharam, Hyderabad",
    score: { value: 9.3, decimals: 1, suffix: "/10", label: "CGPA" },
    notes: ["Head Boy, 2022–23", "Academic Excellence Award", "Technical event volunteer"],
  },
];

export default function Academics() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const list = el.querySelector<HTMLElement>(".acad-list")!;
    const items = [...el.querySelectorAll<HTMLElement>(".acad-item")];
    const countUp = (node: HTMLElement) => {
      const target = Number(node.dataset.value), decimals = Number(node.dataset.decimals);
      if (reduced) { node.textContent = target.toFixed(decimals); return; }
      const t0 = performance.now(), dur = 1400;
      const tick = (now: number) => {
        // clamp at 0: the first frame's timestamp can be a hair earlier than t0
        const k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - k, 4);
        node.textContent = (target * e).toFixed(decimals);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // pop the dot now, reveal the details just after (the CSS delays the card), then count up
    const reveal = (item: HTMLElement) => {
      item.classList.add("in");
      const n = item.querySelector<HTMLElement>("[data-value]");
      if (n) window.setTimeout(() => countUp(n), reduced ? 0 : 520);
    };

    // the line fills with scroll: 0 when the list reaches 60% down the screen, 1 when its end does.
    // Whenever the line's tip passes an entry's dot, that entry pops and reveals (once).
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = list.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
        list.style.setProperty("--p", p.toFixed(4));
        const tip = r.top + p * r.height;
        for (const item of items) {
          if (item.classList.contains("in")) continue;
          const dot = item.querySelector<HTMLElement>(".acad-node")!.getBoundingClientRect();
          if (tip >= dot.top + dot.height / 2 - 2) reveal(item);
        }
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="academics" className="academics" ref={root} aria-labelledby="academics-title">
      <header className="section-head">
        <p className="label">Academics</p>
        <h2 id="academics-title" className="section-title">
          Where I <em>learned.</em>
        </h2>
        <p className="body">
          Engineering in AI &amp; ML at GCET, a Foundation in Data Science from IIT Madras, and the schools
          before that.
        </p>
      </header>

      <div className="acad-list">
        <span className="acad-line" aria-hidden="true"><i /></span>
        <ol className="acad-items">
        {ENTRIES.map((e, i) => (
          <li key={e.school} className={`acad-item ${i % 2 ? "right" : "left"}`}>
            <span className="acad-node" aria-hidden="true" />
            <div className="acad-card">
              <p className="acad-years">
                {e.years}
                <span className="acad-status">{e.status}</span>
              </p>
              <h3>{e.school}</h3>
              <p className="acad-degree">{e.degree}</p>
              <p className="acad-place">{e.place}</p>
              <p className="acad-score" aria-label={`${e.score.label} ${e.score.value}${e.score.suffix ?? ""}`}>
                <b data-value={e.score.value} data-decimals={e.score.decimals} aria-hidden="true">
                  {(0).toFixed(e.score.decimals)}
                </b>
                <small aria-hidden="true">{e.score.suffix}</small>
                <span aria-hidden="true">{e.score.label}</span>
              </p>
              {e.notes && (
                <ul className="acad-notes">
                  {e.notes.map((n) => <li key={n}>{n}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}
