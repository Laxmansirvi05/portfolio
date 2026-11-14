import ProjectGrid from "@/components/ProjectGrid";
import { FEATURED, PROJECTS } from "@/lib/projects";

/** Home page: a single row of four featured projects plus a "Show more" card linking to /projects. */
export default function ProjectsOverview() {
  return (
    <section id="projects" className="projects-overview" aria-labelledby="projects-title">
      <header className="section-head">
        <p className="label">Selected work</p>
        <h2 id="projects-title" className="section-title">
          Things I&apos;ve <em>shipped.</em>
        </h2>
        <p className="body">
          Four builds I&apos;m proudest of: deployed, tested and used by real people.
        </p>
      </header>

      {/* one row: four featured projects + a fifth "Show more" card that opens /projects */}
      <ProjectGrid
        projects={FEATURED}
        variant="overview"
        trigger="view"
        more={{ href: "/projects", count: PROJECTS.length - FEATURED.length }}
        // same fast multi-turn spin as /projects, squeezed into 2 seconds
        duration={2}
      />
    </section>
  );
}
