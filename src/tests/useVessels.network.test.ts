import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVessels } from "@/modules/vessels/useVessels";

describe("useVessels – network errors", (): void => {
  beforeEach((): void => {
    vi.restoreAllMocks();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  it("handles fetch rejection (network error)", async (): Promise<void> => {
    const api = useVessels();
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));

    await api.fetchVessels();
    expect(api.vessels.value).toEqual([]);
    expect(api.error.value).toBe("Network down");
  });

  it("handles malformed JSON (json() throws)", async (): Promise<void> => {
    const api = useVessels();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: (): Promise<unknown> => Promise.reject(new Error("Bad JSON")),
    } as Response);

    await api.fetchVessels();
    expect(api.vessels.value).toEqual([]);
    expect(api.error.value).toBe("Bad JSON");
  });

  it("handles timeout/abort (AbortError)", async (): Promise<void> => {
    const api = useVessels();
    const abortErr = new Error("AbortError");
    vi.spyOn(global, "fetch").mockRejectedValue(abortErr);

    await api.fetchVessels();
    expect(api.vessels.value).toEqual([]);
    expect(api.error.value).toBe("AbortError");
  });
});
