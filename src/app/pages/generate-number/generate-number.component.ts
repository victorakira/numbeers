import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-generate-number',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './generate-number.component.html',
  styleUrl: './generate-number.component.scss',
})
export class GenerateNumberComponent {
  protected inputOnFocus: string = 'number1';
  protected submitted: boolean = false;
  protected formGroup: FormGroup;
  protected link: string = '';

  constructor(fb: FormBuilder, private cryptoService: CryptoService) {
    this.formGroup = fb.group({
      number1: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number2: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number3: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number4: fb.control('', [Validators.required, Validators.maxLength(1)]),
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: any): boolean {
    switch (event.key) {
      case 'Backspace':
        this.formGroup.controls[this.inputOnFocus].reset();
        break;
      case 'Tab':
        this.nextFocus(this.inputOnFocus);
        break;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.formGroup.controls[this.inputOnFocus].setValue(event.key);
          this.nextFocus(this.inputOnFocus);
          return true;
        }
    }

    return false;
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    this.formGroup.controls[this.inputOnFocus].setValue(value);

    this.nextFocus(this.inputOnFocus);
  }

  protected nextFocus(currentElement: string) {
    const keys = Object.keys(this.formGroup.controls);
    const currentIndex = keys.indexOf(currentElement);
    const nextIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
    const nextKey = keys[nextIndex];

    this.inputOnFocus = nextKey;
  }

  protected isValid(fieldName: string): boolean {
    return this.formGroup.controls[fieldName].valid;
  }

  protected send() {
    this.submitted = true;
    this.link = '';
    if (this.formGroup.valid) {
      const values = Object.values(this.formGroup.value).map((x) => String(x));
      const code = this.cryptoService.encrypt(values.join(''));
      this.link = `${window.location.origin}/friend?code=${code}`;
      this.copy();
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
  }
}
