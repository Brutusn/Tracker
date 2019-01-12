import { GpsModule } from './gps.module';

describe('GpsModule', () => {
  let gpsModule: GpsModule;

  beforeEach(() => {
    gpsModule = new GpsModule();
  });

  it('should create an instance', () => {
    expect(gpsModule).toBeTruthy();
  });
});
