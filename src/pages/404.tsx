import { Link } from "gatsby";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ArrowRight } from "../components/Icons";
import { Seo } from "../components/Seo";
import { delay } from "../utils/style";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap not-found">
          <p className="not-found__code intro" aria-hidden="true">
            404
          </p>
          <h1 className="intro" style={delay(0.1)}>
            Lost in orbit.
          </h1>
          <p className="intro" style={delay(0.2)}>
            The page you were looking for doesn't exist, or it has drifted somewhere else.
          </p>
          <Link to="/" className="btn btn--solid intro" style={delay(0.3)}>
            Back to home <ArrowRight />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

export const Head = () => <Seo title="Page not found" />;
