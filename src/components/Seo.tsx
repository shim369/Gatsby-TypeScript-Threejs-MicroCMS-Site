import type { ReactNode } from "react";
import { site } from "../data/site";

type Props = {
  title?: string;
  description?: string;
  image?: string;
  children?: ReactNode;
};

/** Shared <head> for the Gatsby Head API. */
export function Seo({ title, description = site.description, image, children }: Props) {
  const fullTitle = title ? `${title} | ${site.name}` : site.title;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content={site.themeColor} />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={title ? "article" : "website"} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      {children}
    </>
  );
}
