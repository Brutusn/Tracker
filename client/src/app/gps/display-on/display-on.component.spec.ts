import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayOnComponent } from './display-on.component';

describe('DisplayOnComponent', () => {
  let component: DisplayOnComponent;
  let fixture: ComponentFixture<DisplayOnComponent>;

  beforeEach(async(() => {
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
