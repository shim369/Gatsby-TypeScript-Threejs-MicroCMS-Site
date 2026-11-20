import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "gatsby";
import { navLinks, site } from "../data/site";
import { Logo } from "./Icons";

type Props = { home?: boolean };

type NavLinkProps = {
  id: string;
  home: boolean;
  current: string;
  onNavigate: () => void;
  className?: string;
  children: ReactNode;
};

// In-page anchors on the home page, router links everywhere else
function NavLink({ id, home, current, onNavigate, className, children }: NavLinkProps) {
  return home ? (
    <a href={`#${id}`} className={className} onClick={onNavigate} aria-current={current === id || undefined}>
      {children}
    </a>
  ) : (
    <Link to={`/#${id}`} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

export default function Header({ home = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section in the middle of the viewport (home page only)
  useEffect(() => {
    if (!home) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [home]);

  const nav = { home, current, onNavigate: () => menu.current?.hidePopover() };

  return (
    <>
      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
        <div className="wrap header__in">
          {home ? (
            <a href="#top" className="logo">
              <Logo />
              {site.name}
            </a>
          ) : (
            <Link to="/" className="logo">
              <Logo />
              {site.name}
            </Link>
          )}
          <nav className="nav" aria-label="Main">
            {navLinks.map((l) => (
              <NavLink key={l.id} id={l.id} {...nav}>
                {l.label}
              </NavLink>
            ))}
            <NavLink id="contact" className="nav__cta" {...nav}>
              Contact
            </NavLink>
          </nav>
          <button className="menu-btn" type="button" popoverTarget="sp-nav" aria-label="Open menu">
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className="sp-nav" id="sp-nav" popover="auto" ref={menu} aria-label="Mobile">
        <button
          className="menu-btn menu-btn--close"
          type="button"
          popoverTarget="sp-nav"
          popoverTargetAction="hide"
          aria-label="Close menu"
        >
          <span />
          <span />
        </button>
        {[...navLinks, { id: "contact", label: "Contact" }].map((l) => (
          <NavLink key={l.id} id={l.id} {...nav}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
