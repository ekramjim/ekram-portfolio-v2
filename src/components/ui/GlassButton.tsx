import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import styles from "./GlassButton.module.css";

type Look = {
  /** The kit's sizes: small 28px, medium 34px (default), large 50px tall. */
  size?: "small" | "medium" | "large";
  /** A round button holding a single symbol (an arrow, a cross). Give it an aria-label. */
  icon?: boolean;
};
type LinkProps = Look & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };
type ButtonProps = Look & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * The site's one button: Apple's Liquid Glass text button. Use it for every button and button-like link so they all
 * look the same. With `href` it is a link (full URLs open in a new tab, "/paths" use client-side routing, "#hashes" are
 * plain anchors); without, a `<button>` (type "button" unless given). Layout (position, width) belongs to the caller's
 * className; the look lives here. Toggles show their state through `aria-pressed`.
 */
export default function GlassButton(props: LinkProps | ButtonProps) {
  const { size = "medium", icon, className, ...rest } = props;
  const classes = [styles.button, styles[size], icon && styles.icon, className].filter(Boolean).join(" ");

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as Omit<LinkProps, keyof Look | "className">;
    if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...anchor} />;
    if (href.startsWith("/")) return <Link href={href} className={classes} {...anchor} />;
    return <a href={href} className={classes} {...anchor} />;
  }
  const { type = "button", ...button } = rest as Omit<ButtonProps, keyof Look | "className">;
  return <button type={type} className={classes} {...button} />;
}
