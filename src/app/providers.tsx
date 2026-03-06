"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, useState } from "react";
import type { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

// Query client with aggressive refetch settings for live data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 25 * 1000, // 25 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Language context
export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (l: Language) => void;
  t: typeof translations.en;
}>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

/** @deprecated use LanguageContext directly */
export function useLanguage() {
  const { language: lang, setLanguage: setLang, t } = useContext(LanguageContext);
  return { lang, setLang, t };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LanguageContext.Provider
          value={{ language, setLanguage, t: translations[language] }}
        >
          {children}
        </LanguageContext.Provider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
