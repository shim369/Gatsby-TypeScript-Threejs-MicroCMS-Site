import { graphql, Link, type HeadProps, type PageProps } from "gatsby";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ArrowNE, ArrowRight } from "../components/Icons";
import PostCover from "../components/PostCover";
import { Seo } from "../components/Seo";
import Space from "../components/Space";
import { site, skills, spec } from "../data/site";
import { useReveal } from "../hooks/useReveal";
import { formatDate } from "../utils/formatDate";
import { delay } from "../utils/style";

export default function IndexPage({ data }: PageProps<Queries.IndexPageQuery>) {
  useReveal();
  const posts = data.allMicrocmsBlog.nodes;

  return (
    <>
      <Space />
      <div className="progress" aria-hidden="true" />
      <Header home />

      <section className="hero" id="top" data-state="hero">
        <div className="wrap">
          <p className="hero__line intro" style={delay(0.1)}>
            <b>{site.name}</b> — a portfolio and blog
          </p>
          <h1 className="hero__title intro" style={delay(0.2)}>
            <span>Web</span>
            <span className="ln2">Development</span>
          </h1>
          <p className="hero__lead intro" style={delay(0.35)}>
            Fast, accessible websites built with Gatsby, TypeScript and Three.js. Articles are written in
            microCMS and published as static pages.
          </p>
          <div className="hero__actions intro" style={delay(0.45)}>
            <a href="#blog" className="btn btn--solid">
              Read the blog <ArrowRight />
            </a>
            <a href="#contact" className="btn btn--ghost">
              Get in touch
            </a>
          </div>
        </div>
        <p className="hero__orbit intro" style={delay(0.8)}>
          The labels circling the planet are sister sites — the same microCMS content, built with Astro,
          Next.js, Nuxt and SvelteKit.
        </p>
      </section>

      <main>
        <section className="section about" id="about" data-state="about">
          <div className="wrap">
            <div className="head reveal">
              <h2>About</h2>
              <p>Who builds this, and how</p>
            </div>
            <div className="about__grid">
              <div>
                <p className="about__statement reveal">
                  I build websites that <b>load fast</b>, <b>read well</b> and move only when it helps.
                </p>
                <div className="about__text reveal" style={delay(0.1)}>
                  <p>
                    Mostly with TypeScript and React. A little motion and 3D can make a page feel alive, as long
                    as it never gets in the way of reading.
                  </p>
                  <p>
                    This site is made with Gatsby and Three.js. Articles live in microCMS, so new posts go live
                    without touching the code, and the contact form delivers straight to my inbox.
                  </p>
                </div>
                <dl className="spec reveal" style={delay(0.2)}>
                  {spec.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills" id="skills" data-state="skills">
          <div className="wrap">
            <div className="head reveal">
              <h2>Skills</h2>
              <p>What I build with, and where to see it</p>
            </div>
            <ul className="skill-list">
              {skills.map((s, i) => (
                <li key={s.name} className="skill reveal" style={delay((i % 3) * 0.06)}>
                  <div className="skill__name">
                    <span className={`skill__icon${s.here ? " skill__icon--here" : ""}`}>
                      <img src={s.icon} alt="" width={44} height={44} loading="lazy" />
                    </span>
                    {s.name}
                  </div>
                  <p>{s.text}</p>
                  {s.here ? (
                    <span className="skill__here">You are here</span>
                  ) : s.demo ? (
                    <a className="skill__go" href={s.demo} target="_blank" rel="noopener noreferrer">
                      Sister site <ArrowNE />
                      <span className="sr">: {s.name} version (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section blog" id="blog" data-state="blog">
          <div className="wrap">
            <div className="head reveal">
              <h2>Blog</h2>
              <p>Notes from building this site</p>
            </div>
            {posts.length ? (
              <div className="posts">
                {posts.map((post, i) => (
                  <Link
                    key={post.id}
                    to={post.gatsbyPath ?? "/"}
                    className={`post${i === 0 ? " post--lead" : ""} reveal`}
                    style={delay(i * 0.1)}
                  >
                    <div className="post__cover">
                      <PostCover eyecatch={post.eyecatch} seed={i} />
                      {post.category?.name && <span className="post__cat">{post.category.name}</span>}
                    </div>
                    <div>
                      <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
                      <h3>
                        <span>{post.title}</span>
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty">No posts yet.</p>
            )}
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export const Head = (_: HeadProps) => <Seo />;

export const query = graphql`
  query IndexPage {
    allMicrocmsBlog(sort: { publishedAt: DESC }, limit: 3) {
      nodes {
        id
        gatsbyPath(filePath: "/articles/{MicrocmsBlog.blogId}")
        title
        publishedAt
        category {
          name
        }
        eyecatch {
          url
          width
          height
        }
      }
    }
  }
`;
