/**
 * Projects shown on the home overview (first four with `featured`) and on /projects.
 * Facts come from each repository's README on github.com/Laxmansirvi05.
 */

export type Project = {
  slug: string;
  title: string;
  /** One line under the title. */
  summary: string;
  /** Two or three sentences for the /projects page. */
  details: string;
  stack: string[];
  /** Screenshot in /public/projects, or omitted to use a designed tile. */
  image?: string;
  live?: string;
  code?: string;
  /** Short highlight chips, e.g. "820 tests". */
  highlights?: string[];
  featured?: boolean;
  /** Open-source work on someone else's project (shown with a label, never as an own build). */
  contribution?: boolean;
  /** Accent for the designed tile when there is no screenshot. */
  tone?: "iris" | "saffron" | "mint" | "pink";
};

const GH = "https://github.com/Laxmansirvi05";

export const PROJECTS: Project[] = [
  {
    slug: "opportunity-radar",
    title: "Opportunity Radar",
    summary: "AI career platform that helps students find, apply to and prepare for internships.",
    details:
      "A full-stack platform with 31 pages and 50+ API routes: agentic AI search that matches openings to your résumé, a résumé builder with ATS checks, a Kanban application tracker and a library of 20,000+ certifications, with row-level security on every table.",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    image: "/projects/opportunity-radar.jpg",
    live: "https://opportunity-radar-six.vercel.app",
    code: `${GH}/opportunity-radar`,
    highlights: ["31 pages", "50+ APIs", "590+ tests"],
    featured: true,
    tone: "iris",
  },
  {
    slug: "ai-job-search-agent",
    title: "AI Job-Search Agent",
    summary: "The agentic engine behind Opportunity Radar's AI Search.",
    details:
      "Reads a résumé, plans a multi-source web search, scrapes and cleans real postings, then scores each one against the candidate and returns a ranked shortlist with working apply links. Orchestrated in n8n over Node.js/Express microservices, with provider failover and a headless-browser fallback.",
    stack: ["n8n", "Node.js", "Playwright", "PostgreSQL", "Docker"],
    image: "/projects/ai-agent.jpg",
    code: `${GH}/opportunity-radar-ai-agent`,
    highlights: ["Multi-agent pipeline", "Résumé matching"],
    featured: true,
    tone: "saffron",
  },
  {
    slug: "campus-companion",
    title: "Campus Companion",
    summary: "Student records, study material, timed practice exams and an AI study assistant in one app.",
    details:
      "A Java-first learning platform: attendance, marks, CGPA, timetables and notices for students; question banks, quick exams and an AI assistant that explains, summarises and draws diagrams. An AI router falls back between providers automatically. Deployed on Azure with a Render backup.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "Azure"],
    image: "/projects/campus-companion.jpg",
    live: "https://campus-companion.azurewebsites.net",
    code: `${GH}/student-management-system`,
    highlights: ["820 passing tests", "AI provider fallback"],
    featured: true,
    tone: "mint",
  },
  {
    slug: "careroute",
    title: "CareRoute",
    summary: "Healthcare discovery for Hyderabad: hospitals, doctors, medicines and an AI report explainer.",
    details:
      "Search hospitals, doctors, pharmacies and diagnostic centres with maps and road ETAs, ask an AI assistant to explain a medical report in plain language, and try the demo SOS ambulance flow. Built on a Node.js API with Supabase PostGIS and MapLibre.",
    stack: ["Node.js", "Supabase", "PostGIS", "MapLibre"],
    image: "/projects/careroute.jpg",
    live: "https://careroute-black.vercel.app",
    code: `${GH}/Hospital_Managment_System`,
    highlights: ["Maps + ETAs", "AI report explainer"],
    featured: true,
    tone: "pink",
  },
  {
    slug: "inventory",
    title: "Inventory Management System",
    summary: "C++ backend with MySQL triggers, a FIFO order queue and a live SQL panel.",
    details:
      "Products, purchases and sales with stock triggers, low-stock priority alerts, undo and printable bills. A Live SQL panel shows the exact queries, trigger notes and before/after rows behind every action. Built for ADS + DBMS coursework and deployed on Render.",
    stack: ["C++", "MySQL", "Docker"],
    image: "/projects/inventory.jpg",
    live: "https://inventory-8fp8.onrender.com/",
    code: `${GH}/inventory-management-system`,
    highlights: ["Live SQL panel", "Data structures"],
    tone: "saffron",
  },
  {
    slug: "resumeai",
    title: "ResumeAI",
    summary: "AI résumé builder with an ATS score checker and keyword analysis.",
    details:
      "Build or import a résumé, see a live preview, then check it against a job description for an ATS score, matched and missing keywords, and improvement suggestions. Sign-in with password, Google or passkeys.",
    stack: ["TypeScript", "React", "PostgreSQL"],
    image: "/projects/ai-resume.jpg",
    live: "https://resume-ai-web-black.vercel.app",
    code: `${GH}/ResumeAI`,
    highlights: ["ATS scoring", "PDF import/export"],
    tone: "iris",
  },
  {
    slug: "ai-chat",
    title: "AI SaaS Chat App",
    summary: "A production-style AI chat app with Google sign-in and saved conversations.",
    details:
      "Clean landing page, chat interface with conversation history, profile settings and Google authentication, built to feel like a real SaaS product.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    image: "/projects/ai-chatbox.jpg",
    live: "https://ai-saas-chat-app-three.vercel.app",
    code: `${GH}/ai-saas-chat-app`,
    tone: "pink",
  },
  {
    slug: "aether-weather",
    title: "Aether Weather",
    summary: "Live weather, air quality, hourly and 7-day forecasts with animated visuals.",
    details:
      "Search any city for current conditions, UV, AQI, sunrise and sunset, a 24-hour overview, a 7-day forecast and a historical climate view, with unit settings and recent searches.",
    stack: ["React", "Vite", "Tailwind", "Framer Motion"],
    image: "/projects/weather-app.jpg",
    live: "https://aether-weather-dun.vercel.app",
    code: `${GH}/aether-weather`,
    tone: "mint",
  },
  {
    slug: "calculator",
    title: "Advanced Calculator",
    summary: "Multi-mode calculator with temperature, currency and discount tools.",
    details: "A responsive calculator with everyday utility modes alongside standard calculations.",
    stack: ["TypeScript"],
    image: "/projects/calculator.jpg",
    live: "https://advance-calculator-drab.vercel.app",
    code: `${GH}/advance_calculator`,
    tone: "iris",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    summary: "A neon-styled Tic Tac Toe with clear game-state feedback.",
    details: "A polished take on the classic game with a responsive layout and smooth interactions.",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "/projects/tictactoe.jpg",
    live: "https://tic-tac-game-kohl.vercel.app",
    code: `${GH}/tic-tac-game`,
    tone: "pink",
  },
  {
    slug: "deepinterview",
    title: "DeepInterview",
    summary: "Open-source contribution to a voice-first, multilingual AI mock interviewer.",
    details:
      "An open-source project by another developer: upload a CV and job description, talk to an AI interviewer, then get scored and coached. I contributed to it; it is not my own build.",
    stack: ["Python", "LiveKit", "TypeScript"],
    image: "/projects/voice-interview.jpg",
    code: `${GH}/Ai_voice_interview`,
    contribution: true,
    tone: "saffron",
  },
];

export const FEATURED = PROJECTS.filter((p) => p.featured).slice(0, 4);
