"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tech stack, "AI agent installs the stack": when the section scrolls into view, the cyan ai.builder
 * cursor types an `add <group> <tools…>` command per group in a terminal; each tool then flies out of
 * the terminal into its group on the right. Replay runs it again.
 * The list was agreed with the site owner (2026-11-14) from their GitHub code, LinkedIn and old portfolio.
 * The groups are real markup (good for SEO and no-JS); the animation only hides and reveals the chips.
 */

type Tech = { name: string; dot: string };
type Group = { title: string; items: Tech[] };

const GROUPS: Group[] = [
  {
    title: "Languages",
    items: [
      { name: "JavaScript", dot: "#f7df1e" },
      { name: "Java", dot: "#e76f00" },
      { name: "Python", dot: "#3776ab" },
      { name: "C", dot: "#a8b9cc" },
      { name: "SQL (PostgreSQL, MySQL)", dot: "#4169e1" },
      { name: "HTML5", dot: "#e34f26" },
      { name: "CSS3", dot: "#1572b6" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React 19", dot: "#61dafb" },
      { name: "Next.js", dot: "#ffffff" },
      { name: "Vite", dot: "#a259ff" },
      { name: "Tailwind CSS", dot: "#38bdf8" },
      { name: "shadcn/ui", dot: "#ffffff" },
      { name: "Radix UI", dot: "#8b8b8b" },
      { name: "Framer Motion", dot: "#e800ff" },
      { name: "GSAP", dot: "#88ce02" },
      { name: "Three.js / React Three Fiber", dot: "#ffffff" },
    ],
  },
  {
    title: "Backend & APIs",
    items: [
      { name: "Node.js", dot: "#5fa04e" },
      { name: "Express", dot: "#bdbdbd" },
      { name: "Spring Boot", dot: "#6db33f" },
      { name: "REST APIs", dot: "#ffb829" },
    ],
  },
  {
    title: "Databases",
    items: [
      { name: "PostgreSQL", dot: "#4169e1" },
      { name: "Supabase", dot: "#3ecf8e" },
      { name: "MySQL", dot: "#00758f" },
      { name: "Firebase", dot: "#ffca28" },
    ],
  },
  {
    title: "AI & agents",
    items: [
      { name: "Gemini API", dot: "#8e75ff" },
      { name: "Groq", dot: "#f55036" },
      { name: "Ollama", dot: "#ffffff" },
      { name: "AI provider fallback", dot: "#8052ff" },
      { name: "n8n agent pipelines", dot: "#ea4b71" },
      { name: "Tavily search", dot: "#2fd3b0" },
      { name: "Playwright scraping", dot: "#2ead33" },
      { name: "LiveKit voice", dot: "#1fd5f9" },
      { name: "Prompt engineering", dot: "#ffb829" },
      { name: "Claude Code", dot: "#d97757" },
    ],
  },
  {
    title: "Testing",
    items: [
      { name: "Vitest", dot: "#6e9f18" },
      { name: "Playwright", dot: "#2ead33" },
      { name: "Testing Library", dot: "#e33332" },
      { name: "JUnit", dot: "#25a162" },
      { name: "Mockito", dot: "#c5d9c8" },
      { name: "Testcontainers", dot: "#17a6b2" },
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      { name: "Vercel", dot: "#ffffff" },
      { name: "Render", dot: "#8a05ff" },
      { name: "Azure App Service", dot: "#0089d6" },
      { name: "Git & GitHub", dot: "#f05032" },
    ],
  },
  {
    title: "Maps",
    items: [
      { name: "MapLibre", dot: "#396cb2" },
      { name: "Mapbox", dot: "#4264fb" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "VS Code", dot: "#007acc" },
      { name: "Antigravity", dot: "#8052ff" },
      { name: "Postman", dot: "#ff6c37" },
    ],
  },
  {
    title: "CS fundamentals",
    items: [
      { name: "Data structures", dot: "#ffb829" },
      { name: "DBMS", dot: "#2fd3b0" },
    ],
  },
];

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const TOTAL = GROUPS.reduce((n, g) => n + g.items.length, 0);
const PROMPT = '<span class="ps">~/stack $</span> ';
const CARET = '<span class="caret"></span>';
/** One finished step in the terminal history: `~/stack $ add frontend  ✓ 9 added` */
const doneLine = (g: Group) =>
  `${PROMPT}<span class="cmd">add ${slug(g.title)}</span>  <span class="ok">✓ ${g.items.length} added</span>\n`;

export default function TechStack() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const term = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLPreElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const bins = useRef<HTMLDivElement>(null);
  const run = useRef(0);
  const replay = useRef<() => Promise<void>>(async () => {});
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const rel = (el: Element) => {
      const s = stage.current!.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    };
    const chipsOf = (k: number) => [...bins.current!.children[k]!.querySelectorAll<HTMLElement>("li")];
    const finalLog = () =>
      GROUPS.map(doneLine).join("") +
      `<span class="ok">✓ stack ready · ${TOTAL} tools</span>\n${PROMPT}${CARET}`;

    const showAll = () => {
      bins.current!.querySelectorAll("li").forEach((li) => li.classList.add("in"));
      out.current!.innerHTML = finalLog();
      out.current!.scrollTop = out.current!.scrollHeight;
      setState("done");
    };

    async function play() {
      const id = ++run.current;
      const alive = () => id === run.current;
      if (reduced) { showAll(); return; }
      setState("playing");
      const o = out.current!, c = cursor.current!, st = stage.current!;
      st.querySelectorAll(".stack-flyer").forEach((f) => f.remove());
      bins.current!.querySelectorAll("li").forEach((li) => li.classList.remove("in"));
      o.innerHTML = PROMPT + CARET;
      const t0 = rel(term.current!);
      c.style.transform = `translate(${t0.x + 40}px, ${t0.y + 60}px)`;
      c.classList.add("on");
      let log = "";
      for (let k = 0; k < GROUPS.length; k++) {
        const g = GROUPS[k]!;
        const cmd = `add ${slug(g.title)} ${g.items.map((t) => slug(t.name)).join(" ")}`;
        // the agent types the command, its cursor riding the caret
        for (let i = 0; i <= cmd.length; i += 3) {
          if (!alive()) return;
          o.innerHTML = `${log}${PROMPT}<span class="cmd">${cmd.slice(0, i)}</span>${CARET}`;
          o.scrollTop = o.scrollHeight;
          const cr = rel(o.querySelector(".caret")!);
          c.style.transform = `translate(${cr.x + 6}px, ${cr.y + 8}px)`;
          await sleep(14);
        }
        log += doneLine(g); // the long command collapses to one line so the whole history fits
        o.innerHTML = log + PROMPT + CARET;
        o.scrollTop = o.scrollHeight;
        // each tool pops out of the terminal and flies into its group
        const bin = bins.current!.children[k] as HTMLElement;
        bin.classList.add("live");
        const from = rel(term.current!);
        for (const chip of chipsOf(k)) {
          if (!alive()) return;
          const to = rel(chip);
          const fly = chip.cloneNode(true) as HTMLElement;
          fly.className = "stack-chip stack-flyer";
          fly.setAttribute("aria-hidden", "true");
          fly.style.transform = `translate(${from.x + from.w - 140}px, ${from.y + from.h - 60}px) scale(.6)`;
          fly.style.opacity = "0";
          st.appendChild(fly);
          requestAnimationFrame(() => {
            fly.style.opacity = "1";
            fly.style.transform = `translate(${to.x}px, ${to.y}px) scale(1)`;
          });
          window.setTimeout(() => { chip.classList.add("in"); fly.remove(); }, 720);
          await sleep(70);
        }
        window.setTimeout(() => bin.classList.remove("live"), 900);
        await sleep(240);
      }
      if (!alive()) return;
      o.innerHTML = `${log}<span class="ok">✓ stack ready · ${TOTAL} tools</span>\n${PROMPT}${CARET}`;
      o.scrollTop = o.scrollHeight;
      c.style.transform = `translate(${t0.x + t0.w - 110}px, ${t0.y - 34}px)`;
      await sleep(900);
      if (alive()) { c.classList.remove("on"); setState("done"); }
    }

    replay.current = play;
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { io.disconnect(); void play(); } },
      { threshold: 0.35 },
    );
    io.observe(stage.current!);
    const runs = run; // bumping the run id stops a play that is still in progress
    return () => { io.disconnect(); runs.current++; };
  }, []);


  return (
    <section id="tech-stack" className="tech-stack" ref={root} aria-labelledby="stack-title">
      <header className="section-head">
        <p className="label">Tech stack · {TOTAL} tools</p>
        <h2 id="stack-title" className="section-title">
          Tools I <em>build with.</em>
        </h2>
        <p className="body">
          What I&apos;ve actually shipped with, across my projects: from React and Spring Boot to AI agents and
          the tests that keep them honest.
        </p>
      </header>

      <div className={`stack-stage is-${state}`} ref={stage}>
        <div className="stack-term" ref={term} aria-hidden="true">
          <div className="bar">
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
            <b>laxman@portfolio ~ stack</b>
          </div>
          <pre ref={out} />
        </div>

        <div className="stack-bins" ref={bins}>
          {GROUPS.map((g) => (
            <div key={g.title} className="stack-bin">
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((t) => (
                  <li key={t.name} className="stack-chip" style={{ "--dot": t.dot } as React.CSSProperties}>
                    <i aria-hidden="true" />
                    {t.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <span className="agent-cursor tone-cyan stack-agent" ref={cursor} aria-hidden="true">
          <svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" /></svg>
          <b>ai.builder</b>
        </span>

        <button
          type="button"
          className="stack-replay"
          onClick={() => void replay.current()}
          disabled={state === "playing"}
        >
          Replay ↻
        </button>
      </div>
    </section>
  );
}
