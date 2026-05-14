import { useEffect } from "react";

export const SITE_URL = "https://mirandacoast.com.br";
export const DEFAULT_SEO_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_SEO_TITLE = "Miranda Coast - Moda Feminina Delicada e Moderna";
export const DEFAULT_SEO_DESCRIPTION =
  "Miranda Coast: moda feminina moderna, versatil e delicada. Vestidos, conjuntos, blusas e muito mais com estilo costeiro e elegante.";

type SEOProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const setMeta = (selector: string, attr: "content" | "href", value: string) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

  if (!element) {
    if (selector.startsWith("meta")) {
      element = document.createElement("meta");
      const nameMatch = selector.match(/name="([^"]+)"/);
      const propertyMatch = selector.match(/property="([^"]+)"/);
      if (nameMatch) element.setAttribute("name", nameMatch[1]);
      if (propertyMatch) element.setAttribute("property", propertyMatch[1]);
    } else {
      element = document.createElement("link");
      element.setAttribute("rel", "canonical");
    }
    document.head.appendChild(element);
  }

  element.setAttribute(attr, value);
};

const removeMeta = (selector: string) => {
  document.head.querySelector(selector)?.remove();
};

const SEO = ({
  title = DEFAULT_SEO_TITLE,
  description = DEFAULT_SEO_DESCRIPTION,
  canonicalPath = "/",
  image = DEFAULT_SEO_IMAGE,
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;

    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", noIndex ? "noindex,nofollow" : "index,follow");
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[property="og:image:secure_url"]', "content", image);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", image);

    removeMeta('script[data-seo-json-ld="true"]');
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonLd = "true";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, jsonLd, noIndex, title]);

  return null;
};

export default SEO;
