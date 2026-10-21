"use client";

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { capsuleDisplacementMap, GLASS_SCALES, supportsRefraction } from "./liquidGlass";
import styles from "./Navbar.module.css";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "leadership", label: "Leadership" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof LINKS)[number]["id"];

// The floating pieces of the liquid-glass bar, each with its own refraction map sized to it.
const PILLS = ["wordmark", "links", "menu"] as const;
type Pill = (typeof PILLS)[number];
type GlassMap = { width: number; height: number; href: string };
// Keeps only the red, green or blue channel (alpha untouched), so each can be bent separately.
const CHANNEL_MATRICES = [0, 1, 2].map((channel) =>
  [0, 1, 2].map((row) => [0, 1, 2, 3, 4].map((column) => (row === channel && column === row ? 1 : 0)).join(" ")).concat("0 0 0 1 0").join(" "),
);

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
  // True while the bar sits over the dark top of a dark hero, so it switches to light ink.
  const [onDark, setOnDark] = useState(false);
  // Liquid-glass pills by default; ?nav=classic shows the full-width paper bar for comparison.
  const [glass, setGlass] = useState(true);
  const [glassMaps, setGlassMaps] = useState<Partial<Record<Pill, GlassMap>>>({});
  const pillRefs = useRef(new Map<Pill, HTMLElement>());
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false });
  // Bumped whenever the active section changes, restarting the rail's signal sweep.
  const [pulse, setPulse] = useState(0);
  const previousActive = useRef<SectionId | null>(null);
  const linkRefs = useRef(new Map<SectionId, HTMLAnchorElement>());
  const navRef = useRef<HTMLElement>(null);

  const hrefFor = (id: SectionId) => (pathname === "/" ? `#${id}` : `/#${id}`);

  useEffect(() => {
    setGlass(new URLSearchParams(window.location.search).get("nav") !== "classic");
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 36);
      // A dark hero is midnight over roughly its top 40%; below that it pales into mist, where dark ink reads again.
      const hero = document.querySelector<HTMLElement>("[data-hero-dark]");
      setOnDark(hero ? hero.getBoundingClientRect().top + hero.offsetHeight * 0.42 > 37 : false);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [pathname]);

  // Refraction maps follow each pill's size, which changes as fonts load and at breakpoints.
  useEffect(() => {
    if (!glass || !supportsRefraction()) return;
    const observer = new ResizeObserver(() => {
      const maps: Partial<Record<Pill, GlassMap>> = {};
      for (const pill of PILLS) {
        const element = pillRefs.current.get(pill);
        const width = Math.round(element?.offsetWidth ?? 0), height = Math.round(element?.offsetHeight ?? 0);
        if (width && height) maps[pill] = { width, height, href: capsuleDisplacementMap(width, height) };
      }
      setGlassMaps(maps);
    });
    pillRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [glass]);

  const pillRef = (pill: Pill) => (element: HTMLElement | null) => {
    if (element) pillRefs.current.set(pill, element);
    else pillRefs.current.delete(pill);
  };
  const glassFilter = (pill: Pill) => (glassMaps[pill] ? ({ "--glass-filter": `url(#nav-glass-${pill})` } as CSSProperties) : undefined);

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
    <header
      className={styles.header}
      data-scrolled={scrolled ? "" : undefined}
      data-open={open ? "" : undefined}
      data-on-dark={onDark ? "" : undefined}
      data-glass={glass ? "" : undefined}
    >
      {glass && (
        <svg className={styles.glassFilters} aria-hidden="true">
          {PILLS.map((pill) => {
            const map = glassMaps[pill];
            return map && (
              <filter key={pill} id={`nav-glass-${pill}`} x="0" y="0" width={map.width} height={map.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feImage href={map.href} x="0" y="0" width={map.width} height={map.height} preserveAspectRatio="none" result="map" />
                {/* Each colour channel is bent by its own amount, then the three are screened back together. */}
                {GLASS_SCALES.map((scale, channel) => (
                  <Fragment key={channel}>
                    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={`shift${channel}`} />
                    <feColorMatrix in={`shift${channel}`} type="matrix" values={CHANNEL_MATRICES[channel]} result={`channel${channel}`} />
                  </Fragment>
                ))}
                <feBlend in="channel0" in2="channel1" mode="screen" result="redGreen" />
                <feBlend in="redGreen" in2="channel2" mode="screen" />
              </filter>
            );
          })}
        </svg>
      )}
      <div className={styles.inner}>
        <a
          ref={pillRef("wordmark")}
          href={pathname === "/" ? "#top" : "/"}
          className={styles.wordmark}
          style={glassFilter("wordmark")}
          aria-label="Ekram — home"
          onClick={closeMenu}
        >
          EKRAM<span>.</span><i aria-hidden="true" />
        </a>

        <nav
          ref={(element) => {
            navRef.current = element;
            pillRef("links")(element);
          }}
          className={styles.desktopNav}
          style={glassFilter("links")}
          aria-label="Main navigation"
        >
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
          ref={pillRef("menu")}
          type="button"
          className={styles.menuButton}
          style={glassFilter("menu")}
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
