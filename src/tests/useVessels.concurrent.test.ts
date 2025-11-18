import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVessels } from "@/modules/vessels/useVessels";

describe("useVessels – concurrent fetchVessels calls", (): void => {
  beforeEach((): void => {
    vi.restoreAllMocks();
  });
  afterEach((): void => {
    vi.clearAllMocks();
  });

  it("last-resolving request wins when two calls overlap", async (): Promise<void> => {
    const api = useVessels();

    let resolveFirst: (v: unknown) => void = () => {};
    let resolveSecond: (v: unknown) => void = () => {};

    const firstResponse = new Promise((res) => (resolveFirst = res));
    const secondResponse = new Promise((res) => (resolveSecond = res));

    const fetchMock = vi
      .spyOn(global, "fetch")
      // first call -> will resolve later
      .mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: (): Promise<unknown> => firstResponse,
        } as Response)
      )
      // second call -> resolve sooner
      .mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          json: (): Promise<unknown> => secondResponse,
        } as Response)
      );

    const p1 = api.fetchVessels();
    const p2 = api.fetchVessels();

    // Resolve second (newer) call first with data B
    resolveSecond({
      vessels: [
        { _id: "B", name: "Beta", description: "d", image: "i", object: "o" },
      ],
    });
    await p2;
    expect(api.vessels.value.map((v) => v._id)).toEqual(["B"]);

    // Now resolve first (older) call with data A; state will be overwritten
    resolveFirst({
      vessels: [
        { _id: "A", name: "Alpha", description: "d", image: "i", object: "o" },
      ],
    });
    await p1;
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Current implementation: older response overwrites newer when it resolves last
    expect(api.vessels.value.map((v) => v._id)).toEqual(["A"]);
  });
});
