import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFormInputComponent } from './custom-form-input.component';

describe('CustomFormInputComponent', () => {
  let component: CustomFormInputComponent;
  let fixture: ComponentFixture<CustomFormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFormInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomFormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
