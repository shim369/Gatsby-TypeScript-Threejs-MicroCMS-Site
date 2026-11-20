# Gatsby Base

**English** | [日本語](./README.ja.md)

A portfolio and blog built with Gatsby, TypeScript and Three.js. Articles are written in microCMS and published as static pages. A textured planet floats behind the page and moves as you scroll; the sister sites (Astro, Next.js, Nuxt and SvelteKit versions of the same content) orbit it as labelled satellites.

Live site: <https://gatsbybase.vercel.app/>

## Tech stack

| Area         | Tools                                                     |
| ------------ | --------------------------------------------------------- |
| Framework    | Gatsby 5.16, React 19                                     |
| Language     | TypeScript 7                                              |
| 3D           | Three.js r187                                             |
| Styles       | Sass (SCSS modules split by role), self-hosted variable fonts |
| Content      | microCMS (`gatsby-source-microcms`)                       |
| Contact form | Vercel Functions + Nodemailer, optional reCAPTCHA v3      |
| Hosting      | Vercel (Node.js 24)                                       |

## Features

- **Scroll-driven planet**: each section (`data-state`) sets where the planet sits and how big it is. Three.js is loaded as a separate chunk after first paint, so it isn't in the initial bundle.
- **Static blog from microCMS**: article pages come from the File System Route API (`{MicrocmsBlog.blogId}.tsx`). When a post has no eyecatch, a generated planet illustration is shown instead. Eyecatch images are resized and served as WebP through microCMS's image API.
- **Contact form**: built on React 19 `useActionState`, with validation when a field loses focus and when the form is submitted. Messages go to a Vercel Function (`api/contact.ts`) that uses the Web standard `Request`/`Response` API.
- **Modern platform features, little JavaScript**:
  - The mobile menu uses the Popover API, so Esc, light dismiss and focus handling come from the browser. It fades in with `@starting-style`, and `body:has(:popover-open)` locks page scrolling while it is open.
  - The reading progress bar runs on a CSS scroll timeline (`animation-timeline: scroll()`).
  - The hero intro is a CSS animation, and the message box grows with its content through `field-sizing`.
- **Accessibility**: `prefers-reduced-motion` turns off motion, keyboard focus is clearly visible, the current section is marked with `aria-current`, and form errors are linked to their fields.
- **Type-safe GraphQL**: Gatsby's built-in GraphQL Typegen produces the `Queries.*` types.

## Getting started

Requirements: Node.js 24.

```sh
npm install
cp .env.example .env.development   # fill in the values
npm run develop                    # http://localhost:8000
```

`npm run develop` also writes `src/gatsby-types.d.ts`, the generated GraphQL types. Run it at least once before `npm run typecheck`.

### Environment variables

| Name                        | Required | Description                                       |
| --------------------------- | -------- | ------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN`   | yes      | microCMS service ID (the `xxx` in `xxx.microcms.io`) |
| `MICROCMS_API_KEY`          | yes      | microCMS API key                                  |
| `CONTACT_TO_EMAIL`          | yes      | Address that receives contact messages            |
| `SMTP_HOST` / `SMTP_PORT`   | no       | Defaults to `smtp.gmail.com` / `465`              |
| `SMTP_USER` / `SMTP_PASS`   | yes      | SMTP credentials (use an app password for Gmail)  |
| `RECAPTCHA_SECRET_KEY`      | no       | reCAPTCHA v3 secret key, checked on the server    |
| `GATSBY_RECAPTCHA_SITE_KEY` | no       | reCAPTCHA v3 site key, exposed to the browser     |

To use reCAPTCHA, set both keys together. If only the secret key is set, the browser sends no token, so every message is rejected.

Locally, `gatsby-config.ts` loads `.env.<NODE_ENV>` with Node's built-in `process.loadEnvFile`. On Vercel, set the variables in the project settings.

### microCMS schema

The site reads one list API, `blogs`:

| Field       | Type                                  |
| ----------- | ------------------------------------- |
| `title`     | Text                                  |
| `content`   | Rich editor                           |
| `eyecatch`  | Image (optional)                      |
| `category`  | Content reference with `name` (optional) |

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run develop`   | Start the dev server and generate types |
| `npm run build`     | Production build into `public/`       |
| `npm run serve`     | Serve the production build            |
| `npm run typecheck` | Type-check with `tsc --noEmit`        |
| `npm run clean`     | Delete `.cache` and `public`          |

## Project structure

```text
api/contact.ts            Vercel Function for the contact form
gatsby-browser.ts         Global styles and fonts
gatsby-ssr.ts             <html lang>
src/
  components/             Header, Space (planet canvas), Contact, PostCover, Seo, …
  data/site.ts            Site metadata, skills, sister sites
  hooks/useReveal.ts      Scroll reveal (IntersectionObserver)
  three/planet.ts         Three.js scene, loaded lazily
  pages/                  index, 404, articles/{MicrocmsBlog.blogId}
  styles/
    global.scss           Entry point (@use only)
    abstracts/            Mixins and breakpoints
    base/                 Tokens, reset, motion
    layout/               Header, footer, space canvas
    components/           Buttons, form
    sections/             Hero, About, Skills, Blog, Contact
    pages/                Article, 404
static/                   earth.webp (planet texture), favicon.svg
```

## Deployment

Import the repository in Vercel. It detects Gatsby, and every file in `api/` is deployed as a Vercel Function. Add the environment variables listed above, then deploy.

## Notes

- `package.json` overrides `sharp` with a current version. Gatsby's optional `gatsby-sharp` still asks for sharp 0.32, which has no prebuilt binary for recent Node versions and fails to build from source. This site doesn't process images with sharp.
- During the HTML build you may see `ERROR UNKNOWN` followed by a `punycode` deprecation warning. It comes from a Gatsby dependency and doesn't affect the output.
