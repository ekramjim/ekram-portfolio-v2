"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Navbar.module.css";

const LINKS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "leadership", label: "Leadership" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof LINKS)[number]["id"];

function Spark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0c.35 4.45 3.55 7.65 8 8-4.45.35-7.65 3.55-8 8-.35-4.45-3.55-7.65-8-8C4.45 7.65 7.65 4.45 8 0Z" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false });
  // Bumped whenever the active section changes, restarting the rail's signal sweep.
  const [pulse, setPulse] = useState(0);
  const previousActive = useRef<SectionId | null>(null);
  const linkRefs = useRef(new Map<SectionId, HTMLAnchorElement>());
  const navRef = useRef<HTMLElement>(null);

  const hrefFor = (id: SectionId) => (pathname === "/" ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 36);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActive(null);
      return;
    }

    const sections = LINKS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );
    if (!sections.length) return;

    const updateActive = () => {
      const marker = window.innerHeight * 0.38;
      let current: SectionId | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id as SectionId;
      }
      setActive(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [pathname]);

  useEffect(() => {
    if (active && previousActive.current && active !== previousActive.current) setPulse((value) => value + 1);
    previousActive.current = active;
  }, [active]);

  useEffect(() => {
    const positionIndicator = () => {
      const nav = navRef.current;
      const link = active ? linkRefs.current.get(active) : null;
      if (!nav || !link) {
        setIndicator((value) => ({ ...value, visible: false }));
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setIndicator({ x: linkRect.left - navRect.left, width: linkRect.width, visible: true });
    };

    positionIndicator();
    window.addEventListener("resize", positionIndicator);
    document.fonts.ready.then(positionIndicator).catch(() => {});
    return () => window.removeEventListener("resize", positionIndicator);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header} data-scrolled={scrolled ? "" : undefined} data-open={open ? "" : undefined}>
      <div className={styles.inner}>
        <a href={pathname === "/" ? "#top" : "/"} className={styles.wordmark} aria-label="Ekram — home" onClick={closeMenu}>
          EKRAM<span>.</span><i aria-hidden="true" />
        </a>

        <nav ref={navRef} className={styles.desktopNav} aria-label="Main navigation">
          {LINKS.map(({ id, label }) => (
            <a
              key={id}
              ref={(element) => {
                if (element) linkRefs.current.set(id, element);
                else linkRefs.current.delete(id);
              }}
              href={hrefFor(id)}
              className={[id === "contact" ? styles.contact : "", active === id ? styles.active : ""].filter(Boolean).join(" ") || undefined}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
          {pulse > 0 && <span key={pulse} className={styles.signal} aria-hidden="true" />}
          <span
            className={styles.orbit}
            data-visible={indicator.visible ? "" : undefined}
            style={{ "--orbit-x": `${indicator.x}px`, "--orbit-width": `${indicator.width}px` } as CSSProperties}
            aria-hidden="true"
          >
            <Spark />
          </span>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.menuLabel} aria-hidden="true"><span>Menu</span><span>Close</span></span>
          <Spark />
        </button>
      </div>

      <div id="mobile-navigation" className={styles.mobilePanel} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {LINKS.map(({ id, label }, index) => (
            <a
              key={id}
              href={hrefFor(id)}
              className={active === id ? styles.mobileActive : undefined}
              aria-current={active === id ? "location" : undefined}
              onClick={closeMenu}
              style={{ "--i": index } as CSSProperties}
              tabIndex={open ? 0 : -1}
            >
              <span aria-hidden="true"><Spark /></span>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.mobileMeta}>
          <p><i aria-hidden="true" />Available for selected opportunities</p>
          <a href="/cv/ekram-tech-cv.pdf" download tabIndex={open ? 0 : -1}>Download CV <span aria-hidden="true">↓</span></a>
          <small>Melbourne · Australia</small>
        </div>
      </div>
    </header>
  );
}
