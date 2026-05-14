export type CookieConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "miranda-coast:cookie-consent";
export const COOKIE_PREFERENCES_EVENT = "miranda:open-cookie-preferences";
export const COOKIE_CONSENT_UPDATED_EVENT = "miranda:cookie-consent-updated";

export const defaultCookieConsent = (): CookieConsentPreferences => ({
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export const getCookieConsent = (): CookieConsentPreferences | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<CookieConsentPreferences>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const saveCookieConsent = (
  preferences: Omit<CookieConsentPreferences, "necessary" | "updatedAt">,
) => {
  if (typeof window === "undefined") return;

  const consent: CookieConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent }));
};

export const hasOptionalCookieConsent = (category: "analytics" | "marketing") => {
  const consent = getCookieConsent();
  return Boolean(consent?.[category]);
};
