import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HideOffLineComponent } from './hide-off-line.component';

describe('HideOffLineComponent', () => {
  let component: HideOffLineComponent;
  let fixture: ComponentFixture<HideOffLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HideOffLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HideOffLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
