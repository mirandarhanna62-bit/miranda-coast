import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  COOKIE_PREFERENCES_EVENT,
  defaultCookieConsent,
  getCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = getCookieConsent();
    if (!current) {
      setVisible(true);
      return;
    }

    setAnalytics(current.analytics);
    setMarketing(current.marketing);
  }, []);

  useEffect(() => {
    const openPreferences = () => {
      const current = getCookieConsent() || defaultCookieConsent();
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
      setPreferencesOpen(true);
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  const persist = (nextAnalytics: boolean, nextMarketing: boolean) => {
    saveCookieConsent({ analytics: nextAnalytics, marketing: nextMarketing });
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setVisible(false);
    setPreferencesOpen(false);
  };

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 shadow-lg backdrop-blur">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <Cookie className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Privacidade e cookies</p>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Usamos cookies necessarios para manter a loja funcionando. Cookies opcionais
                  podem ajudar em metricas e campanhas, apenas com sua permissao.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <Link className="text-primary underline-offset-4 hover:underline" to="/politica-de-privacidade">
                    Politica de privacidade
                  </Link>
                  <Link className="text-primary underline-offset-4 hover:underline" to="/politica-de-cookies">
                    Politica de cookies
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setPreferencesOpen(true)}>
                Preferencias
              </Button>
              <Button variant="outline" onClick={() => persist(false, false)}>
                Recusar opcionais
              </Button>
              <Button onClick={() => persist(true, true)}>Aceitar todos</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preferencias de cookies</DialogTitle>
            <DialogDescription>
              Voce pode alterar sua escolha quando quiser pelo rodape do site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Necessarios</p>
                  <p className="text-sm text-muted-foreground">
                    Mantem login, seguranca, carrinho e funcionamento basico.
                  </p>
                </div>
                <Switch checked disabled aria-label="Cookies necessarios sempre ativos" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Metricas</p>
                  <p className="text-sm text-muted-foreground">
                    Permite medir visitas e melhorar a experiencia da loja.
                  </p>
                </div>
                <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Permitir cookies de metricas" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Marketing</p>
                  <p className="text-sm text-muted-foreground">
                    Permite campanhas e personalizacao de anuncios, se adicionadas ao site.
                  </p>
                </div>
                <Switch checked={marketing} onCheckedChange={setMarketing} aria-label="Permitir cookies de marketing" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => persist(false, false)}>
              Recusar opcionais
            </Button>
            <Button onClick={() => persist(analytics, marketing)}>Salvar preferencias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
