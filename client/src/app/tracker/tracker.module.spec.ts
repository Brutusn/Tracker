import { TrackerModule } from "./tracker.module";

describe("TrackerModule", () => {
  let trackerModule: TrackerModule;

  beforeEach(() => {
    trackerModule = new TrackerModule();
  });

  it("should create an instance", () => {
    expect(trackerModule).toBeTruthy();
  });
});
