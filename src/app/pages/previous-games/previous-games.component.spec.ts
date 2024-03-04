import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousGamesComponent } from './previous-games.component';

describe('PreviousGamesComponent', () => {
  let component: PreviousGamesComponent;
  let fixture: ComponentFixture<PreviousGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousGamesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviousGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
