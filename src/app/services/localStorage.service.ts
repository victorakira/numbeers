import { Injectable } from '@angular/core';
import { LocalStorageModel } from '../models/localStorageModel';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  get(): LocalStorageModel {
    const item = localStorage.getItem('app');
    if (item) return JSON.parse(item) as LocalStorageModel;
    return new LocalStorageModel();
  }

  save(model: LocalStorageModel) {
    localStorage.setItem('app', JSON.stringify(model));
  }
}
