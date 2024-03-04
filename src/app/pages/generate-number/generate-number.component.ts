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
  protected onKeyDown(event: any): boolean {
    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        this.numbers[this.inputOnFocus] = '';
        break;
      case 'Tab':
        if (event.shiftKey) {
          this.changeFocus(this.inputOnFocus, 'prev');
        } else {
          this.changeFocus(this.inputOnFocus, 'next');
        }
        return false;
      case 'ArrowRight':
        this.changeFocus(this.inputOnFocus, 'next');
        return false;
      case 'ArrowLeft':
        this.changeFocus(this.inputOnFocus, 'prev');
        return false;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.numbers[this.inputOnFocus] = event.key;
          this.changeFocus(this.inputOnFocus, 'next');
        }
        break;
    }

    return true;
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    this.numbers[this.inputOnFocus] = value;

    this.changeFocus(this.inputOnFocus, 'next');
  }

  private changeFocus(currentElement: string, direction: 'next' | 'prev') {
    const keys = Object.keys(this.numbers);
    const currentIndex = keys.indexOf(currentElement);
    let nextIndex = 0;

    if (direction == 'next') {
      nextIndex = (currentIndex + 1) % keys.length;
    } else {
      nextIndex = (currentIndex - 1 + keys.length) % keys.length;
    }

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

      this.link = `${baseUrl}/game/friend?code=${code}`;
    }
  }

  protected copy() {
    navigator.clipboard.writeText(this.link);
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
