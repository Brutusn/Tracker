import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointerComponent } from './pointer.component';

describe('CompassComponent', () => {
  let component: PointerComponent;
  let fixture: ComponentFixture<PointerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
