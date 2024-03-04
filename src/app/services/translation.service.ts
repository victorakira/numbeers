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
  | 'description'
  | 'dailygame'
  | 'play'
  | 'previousgames'
  | 'generate'
  | 'sendlink'
  | 'copylink'
  | 'copiedlink'
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'attempts'
  | 'correctposition'
  | 'wrongposition'
  | 'send'
  | 'stats'
  | 'played'
  | 'wins'
  | 'victory'
  | 'customgame'
  | 'teste';
