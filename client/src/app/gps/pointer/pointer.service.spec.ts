import { TestBed } from '@angular/core/testing';

import { PointerService } from './pointer.service';

describe('PointerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PointerService = TestBed.get(PointerService);
    expect(service).toBeTruthy();
  });
});
