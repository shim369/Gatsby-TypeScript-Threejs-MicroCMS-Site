import React, { useEffect, useState } from "react";
import { Link } from "gatsby";

const links = [
  { to: "/#a01", label: "About" },
  { to: "/#a02", label: "Skills" },
  { to: "/#a03", label: "Blog" },
  { to: "/#a04", label: "Contact" },
];

const HeaderInner: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className={`header-inner ${scrolled ? "is-scrolled" : ""}`}>
      <Link className="logo" to="/">
        Gatsby Base
      </Link>
      <nav className="nav" aria-label="Main navigation">
        <div className="pcNav">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </div>
        <button
          className="mobileNavIcon"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <i className="material-icons" aria-hidden="true">
            {menuOpen ? "close" : "menu"}
          </i>
        </button>
        <div
          className={`offCanvasOverlay ${menuOpen ? "open" : ""}`}
          aria-hidden="true"
          onClick={close}
        />
        <div id="mobile-menu" className={`offCanvasMenu ${menuOpen ? "open" : ""}`}>
          <div className="mobileNav">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={close} tabIndex={menuOpen ? 0 : -1}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HeaderInner;
