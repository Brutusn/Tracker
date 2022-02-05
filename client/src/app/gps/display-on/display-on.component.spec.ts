import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayOnComponent } from './display-on.component';

describe('DisplayOnComponent', () => {
  let component: DisplayOnComponent;
  let fixture: ComponentFixture<DisplayOnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayOnComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
