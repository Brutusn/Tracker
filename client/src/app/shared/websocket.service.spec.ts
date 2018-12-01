import { TestBed } from '@angular/core/testing';

import { SocketService } from './websocket.service';

describe('WebsocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketService = TestBed.get(SocketService);
    expect(service).toBeTruthy();
  });
});
