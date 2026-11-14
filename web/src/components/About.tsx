"use client";

import { useEffect, useRef, useState } from "react";
import TeamLanyardRail, { type LanyardMember } from "@/components/ui/team-lanyard-rail";
import { runAgentBuild } from "@/lib/agentBuild";

const ME: LanyardMember[] = [
  {
    id: "laxman",
    name: "Laxman Sirvi",
    role: "AI & Full-Stack Dev",
    team: "GCET · Hyderabad",
    tone: 1,
    image: "/laxman.jpg",
    bio: "Ships AI products end to end: agentic search, career tools and Spring Boot apps.",
    tags: ["Next.js", "Spring Boot", "AI agents"],
    links: [
      { label: "Email", href: "mailto:laxmansirvi2203@gmail.com" },
      { label: "GitHub", href: "https://github.com/Laxmansirvi05" },
      { label: "LinkedIn", href: "https://linkedin.com/in/laxmansirvi" },
    ],
    drop: 10,
    // short profile URL (no tracking params) keeps the code small enough to scan off a screen
    qr: "https://www.instagram.com/lakshman_choudhary.5",
    qrLabel: "Instagram",
  },
];

const STATS = [
  { value: "9.25", label: "CGPA at GCET" },
  { value: "7+", label: "Apps deployed" },
  { value: "10+", label: "Certifications" },
];

/** Time for the badge to fall and settle (keep in sync with the badge-drop keyframes). */
const DROP_MS = 1300;

/**
 * About me: the ID badge falls from above onto its rail when the section scrolls into view,
 * swings, then flips by itself now and then. Meanwhile three "AI agent" cursors fly in on the right,
 * draw a box for each block of copy and type it in (see lib/agentBuild.ts).
 */
const AGENTS = [
  { name: "ai.writer", tone: "iris" },
  { name: "ai.designer", tone: "cyan" },
  { name: "ai.builder", tone: "saffron" },
] as const;

export default function About() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<"waiting" | "dropping" | "landed">("waiting");
  const [nudge, setNudge] = useState(0);
  const copy = useRef<HTMLDivElement>(null);
  const cursors = useRef<(HTMLSpanElement | null)[]>([]);
  const boxes = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    // Drop once 75% of the section is on screen. If the section is so tall that 75% of it can
    // never be visible at once (phones), drop when as much of it is showing as the screen allows.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        const screen = entry.rootBounds?.height || innerHeight;
        const needed = Math.min(0.75, (0.95 * screen) / entry.boundingClientRect.height);
        if (entry.intersectionRatio < needed) return;
        io.disconnect();
        if (reduced) { setPhase("landed"); return; }
        setPhase("dropping");
        timer = window.setTimeout(() => { setPhase("landed"); setNudge((n) => n + 1); }, DROP_MS);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, []);

  const shown = phase !== "waiting";

  // the agents start building the copy as soon as the badge starts to fall
  useEffect(() => {
    if (!shown || !copy.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    return runAgentBuild(
      copy.current,
      cursors.current.filter(Boolean) as HTMLElement[],
      boxes.current.filter(Boolean) as HTMLElement[],
      { reduced },
    );
  }, [shown]);

  return (
    <section id="about" ref={root} className={`about${shown ? " in-view" : ""}`} aria-labelledby="about-title">
      <div className={`about-badge is-${phase}`}>
        <TeamLanyardRail
          items={ME}
          maxBadgeWidth={280}
          nudge={nudge}
          autoplay={phase === "landed"}
          interval={3600}
          caption="Pull the badge down, or click to flip it."
          labels={{ flip: "Click to flip the badge", back: "Click again or press Esc to turn it back", show: "Show" }}
          aria-label="Laxman Sirvi's ID badge"
        />
      </div>

      <div className="about-copy agent-pending" ref={copy}>
        <div className="agents" aria-hidden="true">
          {AGENTS.map((a, i) => (
            <span key={a.name} className={`agent-box tone-${a.tone}`} ref={(n) => { boxes.current[i] = n; }}>
              <b>{a.name}</b>
            </span>
          ))}
          {AGENTS.map((a, i) => (
            <span key={a.name} className={`agent-cursor tone-${a.tone}`} ref={(n) => { cursors.current[i] = n; }}>
              <svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" /></svg>
              <b>{a.name}</b>
            </span>
          ))}
        </div>
        <p className="label" data-agent="type">About me</p>
        <h2 id="about-title" className="about-title" data-agent="type">
          Hi, I&apos;m Laxman. I turn ideas into <em>working software.</em>
        </h2>
        <p className="body" data-agent="type">
          I&apos;m a second-year B.Tech student in Computer Science (AI &amp; ML) at Geethanjali College of
          Engineering and Technology, Hyderabad, and I&apos;ve completed the Foundation level in Programming
          &amp; Data Science at IIT Madras.
        </p>
        <p className="body" data-agent="type">
          I build end to end: databases and APIs, the interface, and the AI in between. That includes{" "}
          <strong>Opportunity Radar</strong>, an AI career platform for students; the agentic job-search
          engine behind it; and <strong>Campus Companion</strong>, a Spring Boot learning platform with
          800+ passing tests.
        </p>
        <p className="body" data-agent="type">
          I&apos;m looking for internships in AI, data science and full-stack development.
        </p>

        <dl className="about-stats" data-agent="type">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="actions" data-agent="show">
          <a href="/Laxman_Sirvi_Resume.pdf" className="pill" download>Download résumé</a>
          <a href="https://github.com/Laxmansirvi05" className="ghost" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://linkedin.com/in/laxmansirvi" className="ghost" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </div>
    </section>
  );
}
