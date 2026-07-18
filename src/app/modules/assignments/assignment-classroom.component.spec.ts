import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentClassroomComponent } from './assignment-classroom.component';

describe('AssignmentClassroomComponent', () => {
  let component: AssignmentClassroomComponent;
  let fixture: ComponentFixture<AssignmentClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentClassroomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
