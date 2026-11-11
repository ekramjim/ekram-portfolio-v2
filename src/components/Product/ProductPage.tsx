"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import GlassButton from "@/components/ui/GlassButton";
import { useReveal } from "@/components/ui/useReveal";
import type { Product, Shot } from "@/data/products";
import type { Project } from "@/data/projects";
import styles from "./Product.module.css";

interface ProductPageProps {
  product: Product;
  project: Project;
  /** The other in-depth app, linked at the bottom. */
  next?: { product: Product; project: Project };
}

const isExternal = (href: string) => /^https?:/.test(href);

/** One picture, or a row of phones, at the size the section gives it. */
function Shots({ shots, eager }: { shots: Shot[]; eager?: boolean }) {
  return (
    <div className={styles.shots} data-count={shots.length} data-frame={shots[0]?.frame}>
      {shots.map((shot, i) => (
        <div key={shot.src} className={styles.shot} data-frame={shot.frame} style={{ "--a": Math.abs(i - (shots.length - 1) / 2) } as CSSProperties}>
          <Picture shot={shot} eager={eager} />
        </div>
      ))}
    </div>
  );
}

/** A picture in its frame; a website capture gets a browser window around it. */
function Picture({ shot, eager }: { shot: Shot; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- static WebP, already sized
  const img = <img src={shot.src} alt={shot.alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
  if (shot.frame !== "browser") return img;
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar} aria-hidden="true"><i /><i /><i />{shot.host && <span>{shot.host}</span>}</div>
      <div className={styles.viewport}>{img}</div>
    </div>
  );
}

/** The app icon, or for a project without one, a tile in its two colours. */
function Icon({ product, className, size }: { product: Product; className?: string; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- static WebP app icon
  if (product.icon) return <img className={className} src={product.icon} alt="" width={size} height={size} />;
  // "LynkSphere Website" reads as L, not LW.
  const initials = product.name.replace(/\s+Website$/, "").split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  return (
    <span className={`${className ?? ""} ${styles.mono}`} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {initials}
    </span>
  );
}

/** Arrow for links that leave the site, as on the project windows. */
const arrow = (href: string) => (isExternal(href) ? " ↗" : "");

/** The call to action, in the site's Liquid Glass buttons: the main link large, the rest beside it. */
function Actions({ product, center }: { product: Product; center?: boolean }) {
  const [primary, ...rest] = product.actions;
  return (
    <div className={styles.actions} data-center={center ? "" : undefined}>
      {product.status && <span className={styles.soon}>{product.status}</span>}
      {primary && <GlassButton href={primary.href} size={product.status ? "medium" : "large"}>{primary.label}{arrow(primary.href)}</GlassButton>}
      {rest.map((l) => (
        <GlassButton key={l.href} href={l.href}>{l.label}{arrow(l.href)}</GlassButton>
      ))}
    </div>
  );
}

/**
 * An app's page in the manner of Apple's product pages: a big centred headline over a big picture, then one full-width
 * section per feature (some dark for contrast), a grid of tiles with the numbers and smaller features, how it's built,
 * and a closing call to action. A glass bar with the app's name and main link floats in once the hero scrolls away.
 */
export default function ProductPage({ product, project, next }: ProductPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [pastHero, setPastHero] = useState(false);
  useReveal(rootRef);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), { rootMargin: "-40% 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const primary = product.actions[0];
  // Two pictures, the first not a phone: show them as devices, the second in front of the first.
  const devices = product.hero.length === 2 && product.hero[0].frame !== "phone";
  const links = (product.links ?? []).filter((l) => !product.actions.some((a) => a.href === l.href));

  return (
    <main ref={rootRef} className={styles.page} style={{ "--c": project.color, "--c2": project.color2 } as CSSProperties}>
      <GlassButton href="/projects" className={styles.topLink}>← All projects</GlassButton>

      {/* ---------- hero ---------- */}
      <section ref={heroRef} className={styles.hero}>
        <Icon product={product} className={styles.icon} size={88} />
        <h1 className={styles.kicker}>{product.name}</h1>
        <p className={styles.headline}>{product.tagline}</p>
        <p className={styles.lede}>{product.intro}</p>
        <Actions product={product} center />
        {product.hero.length > 0 && (
          <figure className={styles.heroMedia}>
            {devices ? (
              // The Mac (or browser), with the phone standing in front of it at the lower right.
              <div className={styles.devices}>
                {product.hero.map((shot, i) => (
                  <div key={shot.src} className={i === 0 ? styles.mac : styles.phone} data-frame={shot.frame}>
                    <Picture shot={shot} eager />
                  </div>
                ))}
              </div>
            ) : (
              <Shots shots={product.hero} eager />
            )}
            {product.heroCaption && <figcaption>{product.heroCaption}</figcaption>}
          </figure>
        )}
      </section>

      {/* ---------- one section per feature ---------- */}
      {product.chapters.map((chapter) => (
        <section key={chapter.title} id={chapter.id} className={styles.feature} data-dark={chapter.dark ? "" : undefined}>
          <div className={styles.featureHead} data-reveal>
            <p className={styles.eyebrow}>{chapter.eyebrow}</p>
            <h2 className={styles.title}>{chapter.title}</h2>
            <p className={styles.body}>{chapter.body}</p>
          </div>
          {chapter.shots && chapter.shots.length > 0 && (
            <figure className={styles.featureMedia} data-reveal>
              <Shots shots={chapter.shots} />
              {chapter.caption && <figcaption>{chapter.caption}</figcaption>}
            </figure>
          )}
          {chapter.points && (
            <ul className={styles.points} data-reveal>
              {chapter.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </section>
      ))}

      {/* ---------- tiles: the numbers, then the smaller features ---------- */}
      <section className={styles.tilesSection} aria-labelledby="tiles-title">
        <h2 id="tiles-title" className={styles.sectionTitle} data-reveal>And the details.</h2>
        <ul className={styles.tiles}>
          {(product.stats ?? []).map((s, i) => (
            <li key={s.label} className={styles.stat} data-reveal style={{ "--i": i } as CSSProperties}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </li>
          ))}
          {product.extras.map((e, i) => (
            <li key={e.title} className={styles.tile} data-reveal style={{ "--i": i % 3 } as CSSProperties}>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- how it's built ---------- */}
      <section className={styles.build} aria-labelledby="build-title">
        <div className={styles.buildHead} data-reveal>
          <p className={styles.eyebrow}>How it&apos;s built</p>
          <h2 id="build-title" className={styles.title}>{project.stack.slice(0, 3).join(", ")}.</h2>
          <p className={styles.body}>{product.build.intro}</p>
        </div>
        <ul className={styles.stackList} data-reveal>
          {project.stack.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <ol className={styles.notes}>
          {product.build.notes.map((n, i) => (
            <li key={n.title} data-reveal style={{ "--i": i } as CSSProperties}>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- closing call to action ---------- */}
      <section className={styles.closing}>
        <div data-reveal>
          <Icon product={product} className={styles.icon} size={88} />
          <h2 className={styles.title}>{product.name}. {product.tagline}</h2>
          <Actions product={product} center />
          {links.length > 0 && (
            <p className={styles.footLinks}>
              {links.map((l) => (
                <GlassButton key={l.href} href={l.href} size="small">{l.label}{arrow(l.href)}</GlassButton>
              ))}
            </p>
          )}
        </div>
        {next && (
          <Link href={`/apps/${next.product.id}`} className={styles.next} data-reveal style={{ "--c": next.project.color, "--c2": next.project.color2 } as CSSProperties}>
            <span className={styles.nextText}>
              <small>Next</small>
              <b>{next.product.name}</b>
              <span>{next.product.tagline}</span>
            </span>
            <Icon product={next.product} size={72} />
          </Link>
        )}
      </section>

      {/* ---------- floating bar ---------- */}
      <div className={styles.bar} data-show={pastHero ? "" : undefined} aria-hidden={!pastHero}>
        <Icon product={product} size={32} />
        <span className={styles.barName}>{product.name}</span>
        {product.status ? (
          <span className={styles.barSoon}>Coming soon</span>
        ) : (
          primary && <GlassButton href={primary.href} size="small">{primary.label}{arrow(primary.href)}</GlassButton>
        )}
      </div>
    </main>
  );
}
