import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GpsMapComponent } from './gps-map.component';

describe('GpsMapComponent', () => {
  let component: GpsMapComponent;
  let fixture: ComponentFixture<GpsMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GpsMapComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GpsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
