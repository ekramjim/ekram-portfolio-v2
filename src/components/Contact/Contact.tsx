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
  WarningCircle,
  type Icon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { CONTACT_LINKS, type ContactIcon } from "@/data/contact";
import styles from "./Contact.module.css";

const ICONS: Record<Exclude<ContactIcon, "company">, Icon> = {
  cv: FilePdf,
  email: EnvelopeSimple,
  work: Buildings,
  github: GithubLogo,
  linkedin: LinkedinLogo,
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

  const messageReady = form.message.trim().length > 0;
  const nameReady = form.name.trim().length > 0;
  const emailReady = form.email.trim().length > 0;
  const constellationReady = messageReady && nameReady && emailReady;

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
          <div>
            <p className={styles.kicker}><span />Open channel</p>
            <h2 id="contact-title">Have something<br />worth building?</h2>
            <p className={styles.lede}>
              I&apos;m open to collaborations, freelance work, internships, and full-time opportunities.
            </p>
          </div>
        </header>

        <div className={styles.content}>
          <aside className={styles.channels} data-reveal style={{ "--i": 1 } as CSSProperties} aria-label="Direct contact channels">
            <p className={styles.panelTitle}>Direct channels</p>
            <div className={styles.linkList}>
              {CONTACT_LINKS.map((contact) => {
                const Glyph = contact.icon === "company" ? null : ICONS[contact.icon];
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
                    <span className={styles.contactIcon}>
                      {Glyph ? (
                        <Glyph size={19} weight="light" aria-hidden="true" />
                      ) : (
                        <Image
                          src="/images/lynksphereLogo/lsLogoDark.png"
                          alt=""
                          width={22}
                          height={22}
                          className={styles.brandIcon}
                        />
                      )}
                    </span>
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
                <p className={styles.panelTitle}>Contact Form</p>
              </div>
              <div className={styles.constellation} aria-hidden="true">
                <svg viewBox="0 0 180 76" role="presentation">
                  <line x1="17" y1="49" x2="61" y2="18" className={`${styles.starLine} ${messageReady ? styles.active : ""}`} />
                  <line x1="61" y1="18" x2="105" y2="57" className={`${styles.starLine} ${nameReady ? styles.active : ""}`} />
                  <line x1="105" y1="57" x2="142" y2="25" className={`${styles.starLine} ${emailReady ? styles.active : ""}`} />
                  <line x1="142" y1="25" x2="166" y2="48" className={`${styles.starLine} ${constellationReady ? styles.active : ""}`} />
                  <circle cx="17" cy="49" r="3.5" className={`${styles.starNode} ${styles.active}`} />
                  <circle cx="61" cy="18" r="4" className={`${styles.starNode} ${messageReady ? styles.active : ""}`} />
                  <circle cx="105" cy="57" r="4" className={`${styles.starNode} ${nameReady ? styles.active : ""}`} />
                  <circle cx="142" cy="25" r="4" className={`${styles.starNode} ${emailReady ? styles.active : ""}`} />
                  <circle cx="166" cy="48" r="4.5" className={`${styles.starNode} ${constellationReady ? styles.complete : ""}`} />
                </svg>
              </div>
            </div>

            <label className={styles.messagePrompt}>
              <span>What would you like to build?</span>
              <textarea
                name="message"
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                placeholder="Start with the idea, problem, or possibility…"
                rows={5}
                maxLength={3000}
                required
              />
              <small>{form.message.length}/3000</small>
            </label>

            <div className={styles.details}>
              <div className={styles.detailsRule}><span>And where can I reach you?</span></div>

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
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}
