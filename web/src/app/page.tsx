import About from "@/components/About";
import Certificates from "@/components/Certificates";
import Contact from "@/components/Contact";
import Academics from "@/components/Academics";
import HeroAgent from "@/components/HeroAgent";
import HeroTitle from "@/components/HeroTitle";
import Intro from "@/components/Intro";
import ParticleMorph from "@/components/ParticleMorph";
import ProjectsOverview from "@/components/ProjectsOverview";
import TechStack from "@/components/TechStack";

export default function Home() {
  return (
    <>
      <Intro />
      <main>
      <header id="top" className="hero">
        <ParticleMorph />
        <section className="hero-copy agent-pending">
          {/* headline and label type out side by side after the intro */}
          <HeroTitle />
          {/* an agent cursor writes the paragraph once the headline has typed */}
          <HeroAgent />
          <p className="body" data-agent="type">
            Second-year B.Tech student at GCET with a Foundation in Data Science from IIT Madras,
            turning ideas into production software: an agentic job-search engine, an AI career
            platform, and Spring Boot systems deployed for real students.
          </p>
          <div className="actions reveal" style={{ "--d": "0.6s" } as React.CSSProperties}>
            <a href="#projects" className="pill">View projects</a>
            <a href="/Laxman_Sirvi_Resume.pdf" className="ghost" download>
              Download résumé ↓
            </a>
          </div>
        </section>
      </header>
      <About />
      <ProjectsOverview />
      <Academics />
      <TechStack />
      <Certificates />
      <Contact />
      </main>
    </>
  );
}
