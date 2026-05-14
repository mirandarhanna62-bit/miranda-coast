import { Link } from "react-router-dom";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Politica de Privacidade</h1>
          <p className="text-muted-foreground">Ultima atualizacao: 14 de maio de 2026.</p>
        </div>

        <div className="space-y-8 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">1. Quem trata seus dados</h2>
            <p>
              A Miranda Coast trata dados pessoais para operar a loja online, atender clientes,
              processar pedidos, pagamentos, entregas e suporte. Para falar sobre privacidade,
              entre em contato pelo e-mail{" "}
              <a className="text-primary underline-offset-4 hover:underline" href="mailto:mirandacoastr@gmail.com">
                mirandacoastr@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">2. Dados que podemos coletar</h2>
            <p>
              Podemos tratar nome, e-mail, telefone, endereco, CPF quando necessario para
              pagamento ou envio, historico de pedidos, itens comprados, preferencias de entrega,
              mensagens enviadas pelo contato e dados tecnicos de acesso.
            </p>
            <p>
              Dados de pagamento sao processados por provedores especializados, como Mercado
              Pago. A Miranda Coast nao armazena dados completos de cartao.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">3. Para que usamos os dados</h2>
            <p>
              Usamos dados para criar conta, autenticar acesso, montar carrinho, registrar
              pedidos, confirmar pagamento, emitir comprovantes, calcular frete, gerar etiquetas,
              atualizar rastreamento, responder atendimento, prevenir fraude e cumprir obrigacoes
              legais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">4. Bases legais</h2>
            <p>
              O tratamento pode ocorrer para executar contrato de compra, cumprir obrigacoes
              legais ou regulatorias, proteger direitos da loja e do cliente, atender legitimo
              interesse em seguranca e melhoria do servico, ou mediante consentimento para cookies
              opcionais e comunicacoes promocionais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">5. Compartilhamento</h2>
            <p>
              Compartilhamos dados apenas quando necessario com fornecedores da operacao, como
              Supabase para autenticacao e banco de dados, Mercado Pago para pagamentos, Melhor
              Envio e transportadoras para frete, Cloudflare para hospedagem e seguranca, alem de
              autoridades quando houver obrigacao legal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">6. Retencao e seguranca</h2>
            <p>
              Mantemos dados pelo tempo necessario para cumprir as finalidades acima, preservar
              historico de pedidos, atender garantias, exercer direitos e cumprir prazos legais. A
              loja usa controles de acesso, HTTPS e provedores com recursos de seguranca.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">7. Seus direitos</h2>
            <p>
              Voce pode pedir confirmacao de tratamento, acesso, correcao, exclusao quando cabivel,
              portabilidade, informacoes sobre compartilhamento, revisao de consentimento e
              oposicao a tratamentos irregulares. Envie a solicitacao para o e-mail de contato da
              loja.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif text-foreground">8. Cookies</h2>
            <p>
              A loja usa cookies e armazenamento local necessarios para funcionamento. Cookies
              opcionais de metricas e marketing dependem de consentimento. Veja detalhes na{" "}
              <Link className="text-primary underline-offset-4 hover:underline" to="/politica-de-cookies">
                Politica de Cookies
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
