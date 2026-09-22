import React, { createContext, useContext, useState } from 'react';

type Lang = 'en' | 'th';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'th' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);