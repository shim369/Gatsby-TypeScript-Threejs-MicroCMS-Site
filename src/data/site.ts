import astro from "../images/astro.webp";
import figma from "../images/figma.webp";
import gatsby from "../images/gatsby.svg";
import js from "../images/js.webp";
import next from "../images/next.webp";
import nuxt from "../images/nuxt.webp";
import py from "../images/py.webp";

export const site = {
  name: "Gatsby Base",
  title: "Gatsby Base — Web Development",
  description: "Fast, accessible websites built with Gatsby, TypeScript and Three.js.",
  url: "https://gatsbybase.vercel.app",
  github: "https://github.com/shim369",
  themeColor: "#0a0713",
};

export const navLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "blog", label: "Blog" },
];

/** Sister sites: the same microCMS content, built with other frameworks. */
export const sisters = [
  { name: "Astro Base", url: "https://astrobase.vercel.app/" },
  { name: "Next Base", url: "https://nextbase-gsap.vercel.app/" },
  { name: "Nuxt Base", url: "https://nuxtbase-gsap.vercel.app/" },
  { name: "Svelte Base", url: "https://sveltebase-phi.vercel.app/" },
];

export type Skill = {
  name: string;
  text: string;
  icon?: string;
  demo?: string;
  here?: boolean;
};

export const skills: Skill[] = [
  { name: "Gatsby", icon: gatsby, here: true, text: "This site. Pages are built from microCMS at build time, with Three.js on top." },
  { name: "Astro", icon: astro, demo: sisters[0].url, text: "Content-first sites that ship almost no JavaScript, with islands where interaction is needed." },
  { name: "Next.js", icon: next, demo: sisters[1].url, text: "Full-stack React apps with the App Router, deployed on Vercel." },
  { name: "Nuxt", icon: nuxt, demo: sisters[2].url, text: "Vue-powered apps with server rendering and a smooth developer experience." },
  { name: "JavaScript", icon: js, text: "Interactive UI, animation and the everyday logic behind the front end." },
  { name: "Python", icon: py, text: "Automation scripts, data wrangling and small back-end APIs." },
  { name: "Figma", icon: figma, text: "UI design and prototyping, then clean specs for development." },
];

export const spec = [
  { label: "Framework", value: "Gatsby 5 / React 19" },
  { label: "Language", value: "TypeScript" },
  { label: "3D", value: "Three.js" },
  { label: "Content", value: "microCMS" },
  { label: "Contact form", value: "Vercel Functions" },
  { label: "Hosting", value: "Vercel" },
];
