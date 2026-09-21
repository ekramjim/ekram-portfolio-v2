import styles from "./Footer.module.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Leadership", href: "#leadership" },
  { label: "Contact", href: "#contact" },
];

const CONNECT_LINKS = [
  { label: "Email", href: "mailto:ekramjim002@gmail.com" },
  { label: "GitHub", href: "https://github.com/ekramjim" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ekram02" },
  { label: "LynkSphere", href: "https://lynksphere.com" },
  { label: "Download CV", href: "/cv/ekram-tech-cv.pdf", download: true },
  { label: "Archive · v1", href: "/archive/v1" },
];

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <svg className={styles.starMap} viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className={styles.clusterOne}>
          <path d="M45 378 L174 276 L306 326 L406 173 L528 214" />
          <circle cx="45" cy="378" r="3" /><circle cx="174" cy="276" r="4" />
          <circle cx="306" cy="326" r="3" /><circle cx="406" cy="173" r="4" />
          <circle cx="528" cy="214" r="3" />
        </g>
        <g className={styles.clusterTwo}>
          <path d="M832 112 L927 197 L1041 139 L1150 239 L1264 164 L1398 245" />
          <path d="M1041 139 L1082 53" />
          <circle cx="832" cy="112" r="3" /><circle cx="927" cy="197" r="4" />
          <circle cx="1041" cy="139" r="4" /><circle cx="1150" cy="239" r="3" />
          <circle cx="1264" cy="164" r="4" /><circle cx="1398" cy="245" r="3" />
          <circle cx="1082" cy="53" r="3" />
        </g>
        <g className={styles.clusterThree}>
          <path d="M654 465 L728 403 L796 452 L874 378" />
          <circle cx="654" cy="465" r="3" /><circle cx="728" cy="403" r="4" />
          <circle cx="796" cy="452" r="3" /><circle cx="874" cy="378" r="4" />
        </g>
      </svg>

      <div className={styles.inner}>
        <div className={styles.topline}>
          <a href="#top" className={styles.wordmark} aria-label="Ekram — back to top">EKRAM<span>.</span></a>
          <a href="#top" className={styles.backToTop}>Back to top <span aria-hidden="true">↑</span></a>
        </div>

        <div className={styles.main}>
          <div className={styles.closing}>
            <p>From Melbourne, outward.</p>
            <h2>Infusing design with code<br />to make the best outcome.</h2>
            <a className={styles.email} href="mailto:ekramjim002@gmail.com">ekramjim002@gmail.com</a>
          </div>

          <nav className={styles.links} aria-label="Footer navigation">
            <div>
              <p>Explore</p>
              {NAV_LINKS.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            </div>
            <div>
              <p>Connect</p>
              {CONNECT_LINKS.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    download={link.download}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    {link.label}<span aria-hidden="true">↗</span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>

        <div className={styles.bottomline}>
          <span>© {new Date().getFullYear()} Ekram</span>
          <span className={styles.available}><i />Available for selected opportunities</span>
          <span>Melbourne · Australia</span>
        </div>
      </div>
    </footer>
  );
}
