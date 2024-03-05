import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: { [key: string]: any } = {};
  private validLanguages: string[] = ['en-US', 'pt-BR'];

  constructor(private http: HttpClient) {
    const language = localStorage.getItem('language') ?? 'en-US';

    this.changeLanguague(language);
  }

  getLanguage(): string {
    const language = localStorage.getItem('language') ?? 'en-US';

    return this.getValidLanguage(language);
  }

  async changeLanguague(language: string) {
    language = this.getValidLanguage(language);

    await this.loadTranslations(language);
    localStorage.setItem('language', language);
  }

  translate(field: FieldTranslation, defaultValue: string): string {
    return this.translations[field] ?? defaultValue;
  }

  private async loadTranslations(language: string) {
    this.translations = [];
    lastValueFrom(
      this.http.get(`assets/translations/translation.${language}.json`)
    )
      .then((translations) => (this.translations = translations))
      .catch(() => {});
  }

  private getValidLanguage(language: string): string {
    if (!this.validLanguages.includes(language)) return 'en-US';
    return language;
  }
}

export type FieldTranslation =
  | 'gameName'
  | 'description'
  | 'dailyGame'
  | 'play'
  | 'previousGames'
  | 'create'
  | 'sendLink'
  | 'copyLink'
  | 'copiedLink'
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'attempts'
  | 'correctPosition'
  | 'wrongPosition'
  | 'send'
  | 'stats'
  | 'played'
  | 'wins'
  | 'victory'
  | 'customGame'
  | 'settings'
  | 'language';
