import { COOKIE_PREFERENCES_EVENT } from "@/lib/cookie-consent";
import { Button } from "@/components/ui/button";

const openCookiePreferences = () => {
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
};

const PoliticaCookies = () => {
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Politica de Cookies</h1>
          <p className="text-muted-foreground">Ultima atualizacao: 14 de maio de 2026.</p>
        </div>

        <div className="space-y-8 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">1. O que sao cookies</h2>
            <p>
              Cookies e tecnologias parecidas ajudam o site a lembrar informacoes do navegador,
              manter sessoes, proteger a compra e melhorar a navegacao.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">2. Categorias usadas</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-foreground">Necessarios</h3>
                <p>
                  Mantem login, carrinho, seguranca, checkout, preferencias essenciais e recursos
                  tecnicos da loja. Nao podem ser desativados pelo banner.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-foreground">Metricas</h3>
                <p>
                  Podem ser usados para entender visitas e desempenho. Hoje a loja nao carrega
                  ferramenta opcional de metricas sem consentimento.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-foreground">Marketing</h3>
                <p>
                  Podem ser usados para campanhas e personalizacao de anuncios, caso sejam
                  adicionados no futuro. Dependem de consentimento.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">3. Como alterar sua escolha</h2>
            <p>
              Voce pode abrir as preferencias de cookies pelo botao abaixo ou pelo rodape do site.
              Tambem pode limpar cookies e dados do site nas configuracoes do navegador.
            </p>
            <Button onClick={openCookiePreferences}>Gerenciar cookies</Button>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">4. Contato</h2>
            <p>
              Para duvidas sobre cookies e privacidade, fale com a Miranda Coast pelo e-mail{" "}
              <a className="text-primary underline-offset-4 hover:underline" href="mailto:mirandacoastr@gmail.com">
                mirandacoastr@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliticaCookies;
