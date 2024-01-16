import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { CompassComponent } from "./compass.component";

describe("CompassComponent", () => {
  let component: CompassComponent;
  let fixture: ComponentFixture<CompassComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompassComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
