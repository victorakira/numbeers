import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  constructor() {}

  encrypt(value: string): string {
    return btoa(value);
  }

  decrypt(value: string): string {
    return atob(value);
  }
}
