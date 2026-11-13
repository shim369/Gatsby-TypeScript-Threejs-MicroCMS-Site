import React, { useRef } from "react";
import { graphql, Link, HeadFC, PageProps } from "gatsby";
import { Queries } from "../types/graphql";
import "../styles/style.scss";
import ThreeScene from "../components/ThreeScene";
import HeaderInner from "../components/HeaderInner";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { formatDate } from "../utils/formatDate";
import about1 from "../images/about1.jpg";
import about2 from "../images/about2.jpg";
import about3 from "../images/about3.jpg";
import about4 from "../images/about4.jpg";
import astro from "../images/astro.webp";
import js from "../images/js.webp";
import next from "../images/next.webp";
import nuxt from "../images/nuxt.webp";
import py from "../images/py.webp";
import figma from "../images/figma.webp";

const skills = [
  { name: "Astro", img: astro, alt: "Astro", text: "Content-first sites that ship almost no JavaScript, with islands where interaction is needed." },
  { name: "JavaScript", img: js, alt: "JavaScript", text: "Modern ES features for interactive UI, animation and the everyday logic behind the front end." },
  { name: "Next.js", img: next, alt: "Next.js", text: "Full-stack React apps with SSR, SSG and the App Router, deployed on Vercel." },
  { name: "Nuxt.js", img: nuxt, alt: "Nuxt.js", text: "Vue-powered apps with server rendering and a smooth developer experience." },
  { name: "Python", img: py, alt: "Python", text: "Automation scripts, data wrangling and small back-end APIs." },
  { name: "Figma", img: figma, alt: "Figma", text: "UI design and prototyping, then handing clean specs over to development." },
];

const aboutText = [
  "I build fast, accessible and good-looking websites, mostly with TypeScript and React. I like adding a little motion and 3D to make a page feel alive without getting in the way.",
  "This site is made with Gatsby, Three.js and GSAP. Articles live in microCMS, so new posts go live without touching the code, and the contact form delivers straight to my inbox.",
  "I also keep sibling projects built with Next.js, Nuxt and Astro. Take a look around, and get in touch if you'd like to work together.",
];

const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  const root = useRef<HTMLDivElement>(null);
  useScrollAnimations(root);

  const posts = [...data.allMicrocmsBlog.edges]
    .sort(
      (a, b) =>
        new Date(b.node.publishedAt).getTime() -
        new Date(a.node.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <>
      <ThreeScene />
      <div className="scroll-progress" aria-hidden="true" />
      <div className="wrapper" ref={root}>
        <header>
          <HeaderInner />
          <div className="main-read">
            <p className="eyebrow">Portfolio · Gatsby Base</p>
            <h1>
              Web <span>Development</span>
            </h1>
            <ul className="tech-chips" aria-label="Tech stack">
              <li>Gatsby</li>
              <li>TypeScript</li>
              <li>Three.js</li>
              <li>GSAP</li>
              <li>microCMS</li>
            </ul>
          </div>
          <a href="#a01" className="scroll-down">
            Scroll
          </a>
        </header>
        <main>
          <section className="about" id="a01">
            <div className="container">
              <h1 data-reveal>About</h1>
              <div className="flex-box">
                <div className="flex-image" data-stagger-left>
                  {[about1, about2, about3, about4].map((src, i) => (
                    <img key={i} src={src} alt={`about${i + 1}`} />
                  ))}
                </div>
                <div className="flex-text">
                  {aboutText.map((t, i) => (
                    <p key={i} data-reveal data-reveal-delay={i * 0.1}>
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="a02">
            <div className="container skills">
              <h1 data-reveal>Skills</h1>
              <ul className="skills-detail" data-stagger>
                {skills.map((s) => (
                  <li key={s.name} className="stagger-item">
                    <div className="skills-img">
                      <img src={s.img} alt={s.alt} />
                    </div>
                    <div className="skills-text">
                      <h2>{s.name}</h2>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="blog" id="a03">
            <div className="container">
              <h1 data-reveal>Blog</h1>
              <div className="blog-area" data-stagger>
                {posts.map(({ node }) => (
                  <article className="blog-card stagger-item" key={node.blogId}>
                    <div className="img-category">
                      {node.eyecatch?.url && (
                        <img src={node.eyecatch.url} alt={node.title} loading="lazy" />
                      )}
                      {node.category?.name && <h3>{node.category.name}</h3>}
                    </div>
                    <div className="card-body">
                      <div className="date">
                        <i className="material-icons" aria-hidden="true">schedule</i>
                        <time dateTime={node.publishedAt}>{formatDate(node.publishedAt)}</time>
                      </div>
                      <h2>{node.title}</h2>
                      <Link to={`/articles/${node.blogId}`} className="btn-s">
                        Read more{" "}
                        <i className="material-icons" aria-hidden="true">arrow_forward</i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>GATSBY BASE</title>;

export const query = graphql`
  query IndexPage {
    allMicrocmsBlog {
      edges {
        node {
          blogId
          title
          publishedAt
          category {
            name
          }
          eyecatch {
            url
          }
        }
      }
    }
  }
`;
