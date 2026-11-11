"use client";
import { useEffect, useRef, useState } from "react";
import type { DesignImage, Showcase, Swatch, WipeVariant } from "@/data/design";
import styles from "./Design.module.css";

/* eslint-disable @next/next/no-img-element -- static WebPs already sized for the page */

/**
 * A picture laid out like a frame on a Figma canvas: its name above it, and on hover a blue selection outline with
 * corner handles and the frame's size underneath, as Figma draws a selected frame.
 */
export function Frame({ image, className, eager }: { image: DesignImage; className?: string; eager?: boolean }) {
  return (
    <figure className={[styles.frame, image.narrow && styles.narrow, className].filter(Boolean).join(" ")}>
      {image.frame && <figcaption className={styles.frameName}>{image.frame}</figcaption>}
      <div className={styles.frameBody}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
        <span className={styles.handles} aria-hidden="true"><i /><i /><i /><i /></span>
        {image.size && <span className={styles.sizeBadge} aria-hidden="true">{image.size}</span>}
      </div>
    </figure>
  );
}

/** A piece's colours as swatches; a click copies the hex. */
export function Palette({ swatches }: { swatches: Swatch[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async (hex: string) => {
    try { await navigator.clipboard.writeText(hex); } catch { /* the label still says which colour it is */ }
    setCopied(hex);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1400);
  };
  return (
    <ul className={styles.palette} aria-label="Palette">
      {swatches.map((s) => (
        <li key={s.hex + s.name}>
          <button type="button" className={styles.swatch} onClick={() => copy(s.hex)} title={`Copy ${s.hex}`}>
            <span className={styles.chip} style={{ background: s.hex }} />
            <span className={styles.swatchName}>{s.name}</span>
            <span className={styles.swatchHex}>{copied === s.hex ? "Copied" : s.hex}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Phone screens in a row you can drag (or swipe, or scroll) through. */
function ScreenStrip({ screens }: { screens: DesignImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (el) setProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
  };
  // A mouse drags the row; touch and trackpads scroll it natively.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
    ref.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !ref.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    ref.current.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => { drag.current = null; };

  return (
    <div className={styles.strip}>
      <div
        ref={ref}
        className={styles.stripTrack}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        tabIndex={0}
        aria-label="iPhone screens, scroll sideways"
      >
        {screens.map((s) => <Frame key={s.src} image={s} className={styles.screen} />)}
      </div>
      <div className={styles.stripFoot}>
        <span className={styles.meter} aria-hidden="true"><span style={{ transform: `scaleX(${0.12 + progress * 0.88})` }} /></span>
        <span>Drag to see {screens.length} of 31 screens</span>
      </div>
    </div>
  );
}

/** The cover in each version, with the App Store's crops drawn over it. */
function CropView({ versions, crops }: Extract<Showcase, { kind: "crops" }>) {
  const [version, setVersion] = useState(0);
  const [crop, setCrop] = useState<number | null>(1);
  const v = versions[version];
  const c = crop === null ? null : crops[crop];
  return (
    <div className={styles.cropView}>
      <div className={styles.controls}>
        <div className={styles.segmented} role="group" aria-label="Version">
          {versions.map((x, i) => (
            <button key={x.label} type="button" aria-pressed={i === version} onClick={() => setVersion(i)}>{x.label}</button>
          ))}
        </div>
        <div className={styles.segmented} role="group" aria-label="App Store crop">
          <button type="button" aria-pressed={crop === null} onClick={() => setCrop(null)}>Full image</button>
          {crops.map((x, i) => (
            <button key={x.label} type="button" aria-pressed={i === crop} onClick={() => setCrop(i)}>{x.label}</button>
          ))}
        </div>
      </div>
      <figure className={[styles.frame, styles.cropFrame].join(" ")}>
        <figcaption className={styles.frameName}>{v.image.frame}</figcaption>
        <div className={styles.frameBody}>
          <div className={styles.cropStage} style={{ aspectRatio: `${v.image.width} / ${v.image.height}` }}>
            {versions.map((x, i) => (
              <img key={x.image.src} src={x.image.src} alt={i === version ? x.image.alt : ""} aria-hidden={i !== version} width={x.image.width} height={x.image.height} className={i === version ? styles.shown : undefined} draggable={false} />
            ))}
            <span
              className={[styles.cropBox, c && styles.cropOn].filter(Boolean).join(" ")}
              style={c ? { left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%`, height: `${c.h * 100}%` } : { left: 0, top: 0, width: "100%", height: "100%" }}
              aria-hidden="true"
            >
              {c && <em>{c.label}</em>}
            </span>
          </div>
          <span className={styles.handles} aria-hidden="true"><i /><i /><i /><i /></span>
          <span className={styles.sizeBadge} aria-hidden="true">{v.image.size}</span>
        </div>
      </figure>
      <p className={styles.note}>{v.note}</p>
    </div>
  );
}

/** Concepts to the finished icon: a slider scrubs through them; the last step switches light and dark. */
function IconProcess({ steps, light, dark }: Extract<Showcase, { kind: "icons" }>) {
  const all = [...steps.map((s) => ({ label: s.label, image: s.image })), { label: "Final", image: light }];
  const last = all.length - 1;
  const [step, setStep] = useState(last);
  const [isDark, setDark] = useState(false);
  const shown = (i: number) => (i === last ? (isDark ? dark : light) : all[i].image);
  return (
    <div className={styles.iconProcess}>
      <div className={styles.iconStage}>
        {all.map((s, i) => (
          <img key={s.label} src={shown(i).src} alt={i === step ? shown(i).alt : ""} aria-hidden={i !== step} width={shown(i).width} height={shown(i).height} className={i === step ? styles.shown : undefined} draggable={false} />
        ))}
        <span className={styles.iconLabel}>{all[step].label}{step === last ? (isDark ? " · Dark" : " · Light") : ""}</span>
      </div>
      <div className={styles.scrubber}>
        <ol className={styles.ticks}>
          {all.map((s, i) => (
            <li key={s.label}>
              <button type="button" aria-pressed={i === step} onClick={() => setStep(i)}>
                <img src={i === last ? light.src : s.image.src} alt="" width={64} height={64} draggable={false} />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <input
          type="range" min={0} max={last} step={1} value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className={styles.range}
          aria-label="Design step"
          aria-valuetext={all[step].label}
          style={{ "--p": `${(step / last) * 100}%` } as React.CSSProperties}
        />
        <div className={styles.segmented} role="group" aria-label="Appearance" data-disabled={step !== last || undefined}>
          <button type="button" aria-pressed={!isDark} onClick={() => { setStep(last); setDark(false); }}>Light</button>
          <button type="button" aria-pressed={isDark} onClick={() => { setStep(last); setDark(true); }}>Dark</button>
        </div>
      </div>
    </div>
  );
}

/** The original under a recolour; drag the handle to wipe between them, and pick the recolour. */
function Wipe({ original, variants, onVariant }: { original: DesignImage; variants: WipeVariant[]; onVariant: (v: WipeVariant) => void }) {
  const [pos, setPos] = useState(50);
  const [chosen, setChosen] = useState(0);
  const v = variants[chosen];

  useEffect(() => { onVariant(variants[chosen]); }, [chosen, variants, onVariant]);

  return (
    <div className={styles.wipeView}>
      <figure className={[styles.frame, styles.wipeFrame].join(" ")}>
        <figcaption className={styles.frameName}>Allegro · Original → {v.name}</figcaption>
        <div className={styles.frameBody}>
          {/* The range input covers the picture: dragging anywhere on it moves the handle, and the keyboard works too. */}
          <div className={styles.wipe} style={{ aspectRatio: `${original.width} / ${original.height}`, "--pos": `${pos}%` } as React.CSSProperties}>
            <img src={original.src} alt={original.alt} width={original.width} height={original.height} draggable={false} />
            {variants.map((x, i) => (
              <img key={x.src} src={x.src} alt={i === chosen ? `The ${x.name} recolour` : ""} aria-hidden={i !== chosen} width={original.width} height={original.height} className={[styles.wipeTop, i === chosen && styles.shown].filter(Boolean).join(" ")} loading={i === 0 ? "eager" : "lazy"} draggable={false} />
            ))}
            <span className={styles.wipeHandle} aria-hidden="true"><b>‹ ›</b></span>
            <span className={styles.wipeTagL}>Original</span>
            <span className={styles.wipeTagR}>{v.name}</span>
            <input type="range" min={0} max={100} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} className={styles.wipeRange} aria-label="Compare the original with the recolour" />
          </div>
          <span className={styles.handles} aria-hidden="true"><i /><i /><i /><i /></span>
          <span className={styles.sizeBadge} aria-hidden="true">{original.size}</span>
        </div>
      </figure>
      <div className={styles.variantRow} role="group" aria-label="Palette">
        {variants.map((x, i) => (
          <button key={x.name} type="button" aria-pressed={i === chosen} onClick={() => setChosen(i)} className={styles.variant}>
            <span className={styles.variantThumb} style={{ backgroundImage: `url(${x.src})` }} />
            <span>{x.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The interactive part of a piece, by kind. */
export function ShowcaseView({ showcase, onVariant }: { showcase: Showcase; onVariant: (v: WipeVariant) => void }) {
  switch (showcase.kind) {
    case "screens":
      return (
        <>
          <ScreenStrip screens={showcase.screens} />
          <div className={styles.boards}>
            {showcase.boards.map((b, i) => <Frame key={b.src} image={b} className={i === 0 ? styles.wide : styles.half} />)}
          </div>
        </>
      );
    case "crops":
      return <CropView {...showcase} />;
    case "icons":
      return <IconProcess {...showcase} />;
    case "wipe":
      return (
        <>
          <Wipe original={showcase.original} variants={showcase.variants} onVariant={onVariant} />
          <div className={styles.boards}>{showcase.boards.map((b) => <Frame key={b.src} image={b} className={styles.wide} />)}</div>
        </>
      );
    case "board":
      return <div className={styles.boards}>{showcase.images.map((b) => <Frame key={b.src} image={b} className={b.half ? styles.half : styles.wide} />)}</div>;
  }
}
