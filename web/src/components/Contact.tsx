"use client";

import { useEffect, useRef, useState } from "react";
import { runAgentBuild } from "@/lib/agentBuild";

/**
 * Contact, built live by AI agents:
 *  - left: a big call to action, the email (copy button) and logo links;
 *  - right: a "New message" window that ai.designer + ai.builder assemble piece by piece when the
 *    section scrolls into view (lib/agentBuild.ts), then ai.writer types suggestions into the fields.
 * Interactive: topic chips make ai.writer draft a starter message, the window tilts toward the mouse
 * with a spotlight under the cursor, link buttons lean toward the pointer, and the status line
 * reports what happens when you send. "Send email" opens the mail app and "WhatsApp" opens a chat,
 * both prefilled; no server is involved.
 */

const EMAIL = "laxmansirvi2203@gmail.com";
const WHATSAPP = "918688137388"; // +91 86881 37388 in wa.me format

const ICONS = {
  github: (
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  ),
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
  whatsapp: (
    <>
      <path d="M12 1.9a10.1 10.1 0 0 0-8.7 15.2L1.9 22.1l5.1-1.3A10.1 10.1 0 1 0 12 1.9zm0 18.4c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
      <path d="M16.6 14.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.4.3-.4v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.8 4.2 1.8.7 2.4.8 3.3.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </>
  ),
  resume: (
    <path d="M14 1H5.5A2.5 2.5 0 0 0 3 3.5v17A2.5 2.5 0 0 0 5.5 23h13a2.5 2.5 0 0 0 2.5-2.5V8l-7-7zm0 2.8L18.2 8H14V3.8zM7 12h10v1.8H7V12zm0 3.6h10v1.8H7v-1.8zm0-7.2h5v1.8H7V8.4z" />
  ),
  mail: (
    <path d="M2.5 4h19A1.5 1.5 0 0 1 23 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 18.5v-13A1.5 1.5 0 0 1 2.5 4zm.5 2.3v11.7h18V6.3l-9 6.3-9-6.3zM4.8 6l7.2 5 7.2-5H4.8z" />
  ),
};

const LINKS = [
  { label: "GitHub", href: "https://github.com/Laxmansirvi05", icon: ICONS.github, tone: "#ffffff" },
  { label: "LinkedIn", href: "https://linkedin.com/in/laxmansirvi", icon: ICONS.linkedin, tone: "#0a66c2" },
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP}`, icon: ICONS.whatsapp, tone: "#25d366" },
  { label: "Résumé", href: "/Laxman_Sirvi_Resume.pdf", icon: ICONS.resume, tone: "#ffb829", download: true },
];

/** Suggestions ai.writer types into the empty fields (placeholders only). */
const SUGGEST = {
  name: "Your name",
  email: "you@company.com",
  message: "Hi Laxman, I saw your portfolio and I'd like to talk about…",
} as const;
type Field = keyof typeof SUGGEST;

/** Topic chips: clicking one makes ai.writer draft a starter message. */
const TOPICS = [
  { label: "Internship", text: "Hi Laxman, we have an internship opening that fits your AI and full-stack work. Are you available to talk this week?" },
  { label: "Freelance project", text: "Hi Laxman, I have a project I'd like built: a web app with an AI feature. Could we discuss scope and timeline?" },
  { label: "Collaboration", text: "Hi Laxman, I'm working on an idea and looking for a collaborator. Would you be interested in building it together?" },
  { label: "Just saying hi", text: "Hi Laxman, I came across your portfolio and really liked your projects. Just wanted to say hello!" },
];

const BUILDERS = [
  { name: "ai.designer", tone: "cyan" },
  { name: "ai.builder", tone: "saffron" },
] as const;

export default function Contact() {
  const stage = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLFormElement>(null);
  const writer = useRef<HTMLSpanElement>(null);
  const cursors = useRef<(HTMLSpanElement | null)[]>([]);
  const boxes = useRef<(HTMLSpanElement | null)[]>([]);
  const fields = useRef<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>({ name: null, email: null, message: null });
  const writing = useRef(0); // id of the current ai.writer job; a new job cancels the old one
  const autoText = useRef(""); // last message ai.writer drafted, so we only replace our own text
  const [built, setBuilt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "err" | "info"; text: string } | null>(null);
  const [topic, setTopic] = useState(-1);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Move the ai.writer cursor to the caret position after `text` inside a field. */
  const placeWriter = (el: HTMLInputElement | HTMLTextAreaElement, text: string) => {
    const st = stage.current!, c = writer.current!;
    const cs = getComputedStyle(el);
    const measure = document.createElement("canvas").getContext("2d")!;
    measure.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const s = st.getBoundingClientRect(), r = el.getBoundingClientRect();
    const padL = parseFloat(cs.paddingLeft), padT = parseFloat(cs.paddingTop);
    const maxW = r.width - padL - parseFloat(cs.paddingRight);
    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const w = measure.measureText(text).width;
    const line = Math.min(4, Math.floor(w / maxW));
    c.style.transform = `translate(${r.left - s.left + padL + (w - line * maxW) + 2}px, ${r.top - s.top + padT + line * lineH + 4}px)`;
  };

  /** ai.writer types `text` into a field's placeholder or its value. */
  const write = async (f: Field, text: string, into: "placeholder" | "value", job: number) => {
    const el = fields.current[f]!;
    writer.current!.classList.add("on");
    if (reduced()) { el[into] = text; return; }
    placeWriter(el, "");
    await sleep(380);
    const step = into === "value" ? 2 : 1;
    for (let i = step; i <= text.length + step - 1; i += step) {
      if (writing.current !== job) return;
      if (into === "placeholder" && el.value) return; // the visitor started typing here: leave it alone
      const part = text.slice(0, Math.min(i, text.length));
      el[into] = part;
      placeWriter(el, part);
      await sleep(into === "value" ? 16 : 26);
    }
    el[into] = text;
  };

  // 1) when the section scrolls into view, two agents build the message window
  useEffect(() => {
    const st = stage.current!;
    let stop = () => {};
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        stop = runAgentBuild(
          st,
          cursors.current.filter(Boolean) as HTMLElement[],
          boxes.current.filter(Boolean) as HTMLElement[],
          { reduced: reduced(), onDone: () => setBuilt(true) },
        );
      },
      { threshold: 0.35 },
    );
    io.observe(st);
    return () => { io.disconnect(); stop(); };
  }, []);

  // 2) once built, ai.writer fills in suggestions
  useEffect(() => {
    if (!built) return;
    const job = ++writing.current;
    (async () => {
      for (const f of ["name", "email", "message"] as Field[]) {
        await write(f, SUGGEST[f], "placeholder", job);
        if (writing.current !== job) return;
        await sleep(200);
      }
      if (writing.current === job) writer.current!.classList.remove("on");
    })();
    const jobs = writing; // bumping the job id stops ai.writer mid-word
    return () => { jobs.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when the build finishes
  }, [built]);

  // interactive: the window tilts toward the mouse, with a spotlight under the cursor
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced()) return;
    const w = win.current!, r = w.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    w.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    w.style.setProperty("--ry", `${(x - 0.5) * 7}deg`);
    w.style.setProperty("--mx", `${x * 100}%`);
    w.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    const w = win.current!;
    w.style.setProperty("--rx", "0deg");
    w.style.setProperty("--ry", "0deg");
  };

  // interactive: link buttons lean toward the pointer
  const magnet = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || reduced()) return;
    const a = e.currentTarget, r = a.getBoundingClientRect();
    a.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
  };
  const unmagnet = (e: React.PointerEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = ""; };

  const pickTopic = async (i: number) => {
    const msg = fields.current.message!;
    // never overwrite something the visitor wrote themselves
    if (msg.value.trim() && msg.value !== autoText.current) {
      setStatus({ tone: "info", text: "You've already written a message, so I left it as it is." });
      return;
    }
    setTopic(i);
    setStatus(null);
    const job = ++writing.current;
    msg.value = "";
    await write("message", TOPICS[i]!.text, "value", job);
    if (writing.current !== job) return;
    autoText.current = msg.value;
    writer.current!.classList.remove("on");
    msg.focus();
    msg.setSelectionRange(msg.value.length, msg.value.length);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${EMAIL}`;
    }
  };

  const compose = () => {
    const name = fields.current.name!.value.trim();
    const from = fields.current.email!.value.trim();
    const message = fields.current.message!.value.trim();
    if (!message) {
      setStatus({ tone: "err", text: "Write a message first, or pick a topic above." });
      fields.current.message!.focus();
      return null;
    }
    if (from && !/^\S+@\S+\.\S+$/.test(from)) {
      setStatus({ tone: "err", text: "That email address doesn't look right." });
      fields.current.email!.focus();
      return null;
    }
    const sign = [name, from].filter(Boolean).join(" · ");
    return { name, body: sign ? `${message}\n\n— ${sign}` : message };
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const m = compose();
    if (!m) return;
    setStatus({ tone: "ok", text: "Opening your mail app with the message ready. Just press send there." });
    const subject = m.name ? `Hello from ${m.name}` : "Hello from your portfolio";
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(m.body)}`;
  };

  const sendWhatsApp = () => {
    const m = compose();
    if (!m) return;
    setStatus({ tone: "ok", text: "Opening WhatsApp with your message typed in." });
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m.body)}`, "_blank", "noopener");
  };

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="label">Contact</p>
        <h2 id="contact-title" className="contact-title">
          Let&apos;s build <em>something.</em>
        </h2>
        <p className="body">
          Internships, freelance work, a project idea or just a question: write to me and I&apos;ll get back to you.
        </p>

        <div className="contact-email">
          <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS.mail}</svg>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <button type="button" onClick={copyEmail} aria-label="Copy email address">
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Email address copied" : ""}</span>
        </div>

        <ul className="contact-links">
          {LINKS.map((l) => (
            <li key={l.label} style={{ "--tone": l.tone } as React.CSSProperties}>
              <a
                href={l.href}
                {...(l.download ? { download: true } : { target: "_blank", rel: "noreferrer" })}
                onPointerMove={magnet}
                onPointerLeave={unmagnet}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">{l.icon}</svg>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="contact-stage agent-pending" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="agents" aria-hidden="true">
          {BUILDERS.map((a, i) => (
            <span key={a.name} className={`agent-box tone-${a.tone}`} ref={(n) => { boxes.current[i] = n; }}>
              <b>{a.name}</b>
            </span>
          ))}
          {BUILDERS.map((a, i) => (
            <span key={a.name} className={`agent-cursor tone-${a.tone}`} ref={(n) => { cursors.current[i] = n; }}>
              <svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" /></svg>
              <b>{a.name}</b>
            </span>
          ))}
          <span className="agent-cursor tone-iris contact-writer" ref={writer}>
            <svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" /></svg>
            <b>ai.writer</b>
          </span>
        </div>

        <form className="contact-mail" ref={win} onSubmit={sendEmail} noValidate data-agent="show">
          <div className="bar" data-agent="show">
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
            <b>New message</b>
          </div>
          <div className="contact-row" data-agent="type"><span>To</span><output>{EMAIL}</output></div>
          <label className="contact-row" data-agent="show">
            <span>Name</span>
            <input ref={(n) => { fields.current.name = n; }} name="name" autoComplete="name" />
          </label>
          <label className="contact-row" data-agent="show">
            <span>Email</span>
            <input ref={(n) => { fields.current.email = n; }} name="email" type="email" autoComplete="email" />
          </label>
          <div className="contact-topics" data-agent="show" role="group" aria-label="Pick a topic and ai.writer drafts a message">
            <span>Topic</span>
            {TOPICS.map((t, i) => (
              <button key={t.label} type="button" className={topic === i ? "on" : undefined} onClick={() => void pickTopic(i)}>
                {t.label}
              </button>
            ))}
          </div>
          <label className="contact-msg" data-agent="show">
            <span className="sr-only">Message</span>
            <textarea
              ref={(n) => { fields.current.message = n; }}
              name="message"
              rows={6}
              onInput={() => { if (status?.tone === "err") setStatus(null); }}
            />
          </label>
          <div className="contact-actions" data-agent="show">
            <p className={`contact-status${status ? ` is-${status.tone}` : ""}`} role="status">{status?.text}</p>
            <button type="button" className="contact-wa" onClick={sendWhatsApp}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS.whatsapp}</svg>
              WhatsApp
            </button>
            <button type="submit" className="pill contact-send">Send email →</button>
          </div>
        </form>
      </div>
    </section>
  );
}
