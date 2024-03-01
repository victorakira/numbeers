import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-generate-number',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generate-number.component.html',
  styleUrl: './generate-number.component.scss',
})
export class GenerateNumberComponent {
  protected numbers: { [name: string]: string } = {
    number1: '',
    number2: '',
    number3: '',
    number4: '',
  };

  protected inputOnFocus: string = 'number1';
  protected submitted: boolean = false;
  protected copied: boolean = false;
  protected link: string = '';

  constructor(private cryptoService: CryptoService) {}

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: any) {
    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        this.numbers[this.inputOnFocus] = '';
        break;
      case 'Tab':
        this.nextFocus(this.inputOnFocus);
        break;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.numbers[this.inputOnFocus] = event.key;
          this.nextFocus(this.inputOnFocus);
        }
        break;
    }
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    this.numbers[this.inputOnFocus] = value;

    this.nextFocus(this.inputOnFocus);
  }

  protected nextFocus(currentElement: string) {
    const keys = Object.keys(this.numbers);
    const currentIndex = keys.indexOf(currentElement);
    const nextIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
    const nextKey = keys[nextIndex];

    this.inputOnFocus = nextKey;
  }

  protected getValue(fieldName: string): string {
    return this.numbers[fieldName];
  }

  protected isValid(fieldName: string): boolean {
    return this.numbers[fieldName] !== '';
  }

  protected send() {
    this.submitted = true;
    this.link = '';

    const values = Object.values(this.numbers).map((x) => String(x));
    const answer = values.join('');

    if (answer.length === values.length) {
      const baseUrl = window.location.href.replace('/generate-number', '');
      const code = this.cryptoService.encrypt(answer);

      this.link = `${baseUrl}/friend?code=${code}`;
    }
  }

  protected copy() {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.value = this.link;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
