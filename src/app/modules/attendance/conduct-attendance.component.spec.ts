import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductAttendanceComponent } from './conduct-attendance.component';

describe('ConductAttendanceComponent', () => {
  let component: ConductAttendanceComponent;
  let fixture: ComponentFixture<ConductAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
