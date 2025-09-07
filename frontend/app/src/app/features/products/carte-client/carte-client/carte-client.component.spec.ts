import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteClientComponent } from './carte-client.component';

describe('CarteClientComponent', () => {
  let component: CarteClientComponent;
  let fixture: ComponentFixture<CarteClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
