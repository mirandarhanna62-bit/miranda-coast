import { useLocation } from "react-router-dom";
import SEO, { DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, SITE_URL } from "@/components/SEO";

const publicRoutes: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
  },
  "/novidades": {
    title: "Novidades Miranda Coast - Lancamentos de Moda Feminina",
    description: "Confira novidades, pecas recentes e selecoes especiais da Miranda Coast.",
  },
  "/loja": {
    title: "Loja Miranda Coast - Vestidos, Blusas e Conjuntos Femininos",
    description: "Compre moda feminina delicada e moderna na Miranda Coast com entrega ou retirada na loja.",
  },
  "/sobre": {
    title: "Sobre a Miranda Coast - Moda Feminina com Personalidade",
    description: "Conheca a historia, valores e proposta da Miranda Coast para mulheres modernas.",
  },
  "/contato": {
    title: "Contato Miranda Coast",
    description: "Fale com a Miranda Coast para tirar duvidas sobre pedidos, produtos e atendimento.",
  },
  "/rastreamento": {
    title: "Rastreamento de Pedido - Miranda Coast",
    description: "Acompanhe o envio do seu pedido feito na Miranda Coast.",
  },
  "/politica-troca": {
    title: "Trocas e Devolucoes - Miranda Coast",
    description: "Consulte as regras de troca, devolucao e arrependimento da Miranda Coast.",
  },
  "/politica-de-privacidade": {
    title: "Politica de Privacidade - Miranda Coast",
    description: "Entenda como a Miranda Coast trata dados pessoais no cadastro, compra, pagamento e envio.",
  },
  "/politica-de-cookies": {
    title: "Politica de Cookies - Miranda Coast",
    description: "Veja como a Miranda Coast usa cookies necessarios e preferencias de consentimento.",
  },
};

const privatePrefixes = ["/admin", "/auth", "/checkout", "/pedido", "/meus-pedidos"];

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Miranda Coast",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    sameAs: ["https://www.instagram.com/miranda_coast/"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "mirandacoastr@gmail.com",
      contactType: "customer service",
      availableLanguage: "Portuguese",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Miranda Coast",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/loja?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

const RouteSEO = () => {
  const { pathname } = useLocation();
  const isProduct = pathname.startsWith("/produto/");
  const isPrivate = privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProduct) return null;

  const route = publicRoutes[pathname];
  return (
    <SEO
      title={route?.title || DEFAULT_SEO_TITLE}
      description={route?.description || DEFAULT_SEO_DESCRIPTION}
      canonicalPath={route ? pathname : "/"}
      noIndex={isPrivate || !route}
      jsonLd={pathname === "/" ? homeJsonLd : undefined}
    />
  );
};

export default RouteSEO;
