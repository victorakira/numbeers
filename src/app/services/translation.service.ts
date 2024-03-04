import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: { [key: string]: any } = {};

  constructor(private http: HttpClient) {
    const language = localStorage.getItem('language') ?? 'en';

    this.changeLanguague(language);
  }

  async changeLanguague(language: string) {
    await this.loadTranslations(language);
    localStorage.setItem('language', language);
  }

  translate(field: string): string {
    return this.translations[field];
  }

  private async loadTranslations(language: string) {
    const translations = await lastValueFrom(
      this.http.get(`assets/translations/translation.${language}.json`)
    );

    this.translations = translations;
  }
}
