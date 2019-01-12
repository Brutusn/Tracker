import { TestBed } from '@angular/core/testing';

import { CompassService } from './compass.service';

describe('CompassService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompassService = TestBed.get(CompassService);
    expect(service).toBeTruthy();
  });
});
