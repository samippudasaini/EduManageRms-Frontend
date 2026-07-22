import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NepaliDateComponent } from './nepali-date.component';

describe('NepaliDateComponent', () => {
  let component: NepaliDateComponent;
  let fixture: ComponentFixture<NepaliDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NepaliDateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NepaliDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
