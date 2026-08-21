import { loadVoiceSettings } from './multilingualSpeech';

export function getSpeechLocale(): string {
  try {
    const settings = loadVoiceSettings();
    return settings.preferredLanguage || 'af-ZA';
  } catch {
    return 'af-ZA';
  }
}
