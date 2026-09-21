"use client";

import {
  ArrowUpRight,
  Buildings,
  CheckCircle,
  EnvelopeSimple,
  FilePdf,
  GithubLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  Radio,
  WarningCircle,
  type Icon,
} from "@phosphor-icons/react";
import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { CONTACT_LINKS, type ContactIcon } from "@/data/contact";
import styles from "./Contact.module.css";

const ICONS: Record<ContactIcon, Icon> = {
  cv: FilePdf,
  email: EnvelopeSimple,
  work: Buildings,
  github: GithubLogo,
  linkedin: LinkedinLogo,
  company: Radio,
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "", website: "" };

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Message could not be sent");
      setForm(EMPTY_FORM);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section ref={sectionRef} id="contact" className={styles.section} aria-labelledby="contact-title">
      <StarBackdrop />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.intro} data-reveal>
          <div className={styles.signal} aria-hidden="true">
            <span className={styles.orbitOuter} />
            <span className={styles.orbitInner} />
            <span className={styles.signalCore} />
          </div>
          <div>
            <p className={styles.kicker}><span />Open channel</p>
            <h2 id="contact-title">Have something<br />worth building?</h2>
            <p className={styles.lede}>
              I&apos;m open to collaborations, freelance work, internships, and full-time opportunities.
              Send the first signal and I&apos;ll take it from there.
            </p>
          </div>
        </header>

        <div className={styles.content}>
          <aside className={styles.channels} data-reveal style={{ "--i": 1 } as CSSProperties} aria-label="Direct contact channels">
            <p className={styles.panelTitle}>Direct channels</p>
            <div className={styles.linkList}>
              {CONTACT_LINKS.map((contact) => {
                const Glyph = ICONS[contact.icon];
                const isExternal = contact.href.startsWith("http");

                return (
                  <a
                    key={contact.label}
                    href={contact.href}
                    download={contact.download}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className={styles.contactLink}
                  >
                    <span className={styles.contactIcon}><Glyph size={19} weight="light" aria-hidden="true" /></span>
                    <span className={styles.contactText}>
                      <span>{contact.label}</span>
                      <strong>{contact.value}</strong>
                    </span>
                    <ArrowUpRight className={styles.linkArrow} size={17} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <p className={styles.localTime}>Based in Melbourne · UTC+10/11</p>
          </aside>

          <form className={styles.form} onSubmit={submit} data-reveal style={{ "--i": 2 } as CSSProperties}>
            <div className={styles.formHead}>
              <div>
                <p className={styles.panelTitle}>Compose a message</p>
                <p>Delivered straight to my inbox.</p>
              </div>
              <span className={styles.packet}>Signal 001</span>
            </div>

            <div className={styles.twoColumns}>
              <label>
                <span>Your name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Ada Lovelace"
                  maxLength={100}
                  required
                />
              </label>
              <label>
                <span>Your email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="ada@example.com"
                  maxLength={254}
                  required
                />
              </label>
            </div>

            <label>
              <span>What&apos;s this about? <em>Optional</em></span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={(event) => update("subject", event.target.value)}
                placeholder="A project, role, or good conversation"
                maxLength={160}
              />
            </label>

            <label>
              <span>Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                placeholder="Tell me what you have in mind…"
                rows={6}
                maxLength={3000}
                required
              />
              <small>{form.message.length}/3000</small>
            </label>

            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input name="website" value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" />
            </label>

            <div className={styles.formFooter}>
              <button type="submit" disabled={status === "sending"}>
                <span>{status === "sending" ? "Transmitting…" : "Send message"}</span>
                <PaperPlaneTilt size={18} weight="fill" aria-hidden="true" />
              </button>
              <div className={styles.status} role="status" aria-live="polite">
                {status === "sent" && <><CheckCircle size={18} weight="fill" />Signal received. I&apos;ll be in touch.</>}
                {status === "error" && <><WarningCircle size={18} weight="fill" />Couldn&apos;t send. Try email instead.</>}
              </div>
            </div>
          </form>
        </div>

        <footer className={styles.footer} data-reveal style={{ "--i": 3 } as CSSProperties}>
          <span>© {new Date().getFullYear()} Ekram</span>
          <span>Designed and built in Melbourne</span>
        </footer>
      </div>
    </section>
  );
}
