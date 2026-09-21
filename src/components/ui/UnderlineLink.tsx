import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import styles from "./UnderlineLink.module.css";

type UnderlineLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

/**
 * The site's one underlined link. Use it for every text link that carries an underline so they all look the same.
 * Layout (padding, font size) belongs to the caller's className; the colour, underline and focus ring live here.
 * Full URLs open in a new tab, "/paths" use client-side routing, and "#hashes" are plain anchors.
 */
export default function UnderlineLink({ href, className, ...rest }: UnderlineLinkProps) {
  const classes = className ? `${styles.link} ${className}` : styles.link;
  if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest} />;
  if (href.startsWith("/")) return <Link href={href} className={classes} {...rest} />;
  return <a href={href} className={classes} {...rest} />;
}
