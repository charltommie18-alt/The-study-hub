export type SupportedLanguage = 'en' | 'af' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export const LANGUAGE_KEY = 'fabelo_language';

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  if (!value) return 'en';

  const language = value.toLowerCase();

  if (language === 'af' || language.startsWith('af-')) {
    return 'af';
  }

  if (language === 'es' || language.startsWith('es-')) {
    return 'es';
  }

  return 'en';
}

export function getSpeechLanguage(language: string): string {
  switch (normalizeLanguage(language)) {
    case 'af':
      return 'af-ZA';

    case 'es':
      return 'es-ES';

    case 'en':
    default:
      return 'en-US';
  }
}
