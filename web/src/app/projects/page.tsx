import type { Metadata } from "next";
import ParticleMorph from "@/components/ParticleMorph";
import ProjectGrid from "@/components/ProjectGrid";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects — Laxman Sirvi",
  description:
    "Everything Laxman Sirvi has built: an AI career platform, an agentic job-search engine, Spring Boot and C++ systems, and more.",
};

/**
 * Full project list. The title rises in first, then every card flies in from deep space,
 * sweeps through a ring and lands in the grid (see ProjectGrid).
 */
export default function ProjectsPage() {
  return (
    <main className="page projects-page">
      <ParticleMorph ambientOnly />
      <header className="section-head page-head">
        <p className="label rise" style={{ "--d": "0.05s" } as React.CSSProperties}>
          Projects · {PROJECTS.length} builds
        </p>
        <h1 className="section-title rise" style={{ "--d": "0.15s" } as React.CSSProperties}>
          Everything I&apos;ve <em>built.</em>
        </h1>
        <p className="body rise" style={{ "--d": "0.3s" } as React.CSSProperties}>
          From production AI platforms to coursework systems, with live links and source code for each.
        </p>
      </header>
      <ProjectGrid projects={PROJECTS} variant="full" trigger="load" />
    </main>
  );
}
