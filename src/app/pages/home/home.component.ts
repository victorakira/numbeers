import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FieldTranslation,
  TranslationService,
} from '../../services/translation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private translation: TranslationService) {}

  translate(field: FieldTranslation, defaultValue: string): string {
    return this.translation.translate(field, defaultValue);
  }

  protected get formatedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    const language = this.translation.getLanguage();

    return new Date().toLocaleDateString(language, options);
  }
}
