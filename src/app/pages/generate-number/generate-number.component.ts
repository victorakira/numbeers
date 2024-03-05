import { Component } from '@angular/core';
import { CustomFormInputComponent } from '../../components/custom-form-input/custom-form-input.component';
import { CryptoService } from '../../services/crypto.service';
import {
  FieldTranslation,
  TranslationService,
} from '../../services/translation.service';

@Component({
  selector: 'app-generate-number',
  standalone: true,
  imports: [CustomFormInputComponent],
  templateUrl: './generate-number.component.html',
  styleUrl: './generate-number.component.scss',
})
export class GenerateNumberComponent {
  protected copied: boolean = false;
  protected link: string = '';

  constructor(
    private cryptoService: CryptoService,
    private translation: TranslationService
  ) {}

  translate(field: FieldTranslation, defaultValue: string): string {
    return this.translation.translate(field, defaultValue);
  }

  protected send(value: string[]) {
    const answer = value.join('');

    const baseUrl = window.location.href.replace('/generate-number', '');
    const code = this.cryptoService.encrypt(answer);

    this.link = `${baseUrl}/game/friend?code=${code}`;
  }

  protected copy() {
    navigator.clipboard.writeText(this.link);
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
