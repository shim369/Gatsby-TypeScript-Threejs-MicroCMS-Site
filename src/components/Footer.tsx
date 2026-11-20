import { site } from "../data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <small>
          &copy; {new Date().getFullYear()} {site.name}
        </small>
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}
