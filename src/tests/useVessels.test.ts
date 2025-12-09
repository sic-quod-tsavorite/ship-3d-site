// Imports
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Project imports
import { useVessels } from "@/modules/vessels/useVessels";
import type { Vessel } from "@/interfaces/vesselInterfaces";

const API = "http://api.test";

// Mock the vessels store - will actually call fetch with the test API
vi.mock("@/stores/vessels", (): object => ({
  useVesselsStore: (): object => ({
    fetchVessels: async (): Promise<void> => {
      try {
        await fetch(`${API}/vessels`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      } catch {
        // ignore errors in store fetch
      }
    },
  }),
}));

interface FetchResponse {
  ok: boolean;
  json: () => Promise<
    | Vessel[]
    | { vessels: Vessel[] }
    | { data: Vessel[] }
    | { vessel: Vessel }
    | { error?: string; message?: string }
  >;
}

describe("useVessels", (): void => {
  beforeEach((): void => {
    vi.stubEnv("VITE_API_URL", API);
    vi.restoreAllMocks();
  });
  afterEach((): void => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns image and object URLs as-is", (): void => {
    const api = useVessels();

    expect(api.getImageUrl("")).toBe("");
    expect(api.getImageUrl("https://cdn/x.png")).toBe("https://cdn/x.png");
    expect(api.getImageUrl(`${API}/uploads/images/file.jpg`)).toBe(
      `${API}/uploads/images/file.jpg`
    );

    expect(api.getObjectUrl("")).toBe("");
    expect(api.getObjectUrl("https://cdn/m.glb")).toBe("https://cdn/m.glb");
    expect(api.getObjectUrl(`${API}/uploads/objects/model.glb`)).toBe(
      `${API}/uploads/objects/model.glb`
    );
  });

  it("validates image and object files", { timeout: 10000 }, (): void => {
    const api = useVessels();

    const mk = (name: string, type: string, size: number): File =>
      new File([new Blob(["x".repeat(size)], { type })], name, { type });

    // image
    expect(api.validateImageFile(null)).toBeNull();
    expect(api.validateImageFile(mk("a.png", "image/png", 10))).toBeNull();
    expect(api.validateImageFile(mk("a.bmp", "image/bmp", 10))).toContain(
      "Image must be"
    );
    expect(
      api.validateImageFile(mk("a.png", "image/png", 11 * 1024 * 1024))
    ).toContain("10MB");

    // object
    expect(api.validateObjectFile(null)).toBeNull();
    expect(
      api.validateObjectFile(mk("m.glb", "application/octet-stream", 10))
    ).toBeNull();
    expect(
      api.validateObjectFile(mk("m.gltf", "model/gltf+json", 10))
    ).toBeNull();
    expect(api.validateObjectFile(mk("m.obj", "text/plain", 10))).toContain(
      "GLB or GLTF"
    );
    expect(
      api.validateObjectFile(
        mk("m.glb", "application/octet-stream", 51 * 1024 * 1024)
      )
    ).toContain("50MB");
  });

  it("fetchVessels parses various response shapes", async (): Promise<void> => {
    const api = useVessels();

    const cases: FetchResponse[] = [
      {
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: "1",
              name: "A",
              description: "D",
              image: "i.jpg",
              object: "o.glb",
              category: "Survey",
            },
          ]),
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            vessels: [
              {
                _id: "2",
                name: "B",
                description: "D",
                image: "i.jpg",
                object: "o.glb",
                category: "Maintenance",
              },
            ],
          }),
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                _id: "3",
                name: "C",
                description: "D",
                image: "i.jpg",
                object: "o.glb",
                category: "Supply",
              },
            ],
          }),
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            vessel: {
              _id: "4",
              name: "D",
              description: "D",
              image: "i.jpg",
              object: "o.glb",
              category: "Guard",
            },
          }),
      },
    ];

    let idx = 0;
    vi.spyOn(global, "fetch").mockImplementation(
      (): Promise<Response> =>
        Promise.resolve({
          ok: cases[idx].ok,
          json: cases[idx].json,
        } as Response)
    );

    for (idx = 0; idx < cases.length; idx++) {
      await api.fetchVessels();
    }

    expect(global.fetch).toHaveBeenCalledTimes(cases.length);
    expect(api.vessels.value.length).toBeGreaterThan(0);
    expect(api.error.value).toBeNull();
  });

  it("fetchVessels handles error response with message", async (): Promise<void> => {
    const api = useVessels();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: (): Promise<object> => Promise.resolve({ error: "Bad request" }),
    } as Response);

    await api.fetchVessels();
    expect(api.vessels.value).toEqual([]);
    expect(api.error.value).toBe("Bad request");
  });

  it("createVessel validates files then posts and refreshes", async (): Promise<void> => {
    const api = useVessels();

    // missing image
    let ok = await api.createVessel({
      name: "N",
      description: "D",
      imageFile: null,
      objectFile: null,
      category: "Survey",
    });
    expect(ok).toBe(false);
    expect(api.error.value).toContain("Image is required");

    // proper case
    const fImg = new File([new Blob(["x"])], "img.png", { type: "image/png" });
    const fObj = new File([new Blob(["x"])], "m.glb", {
      type: "application/octet-stream",
    });

    const appendSpy = vi.spyOn(FormData.prototype, "append");

    const fetchMock = vi
      .spyOn(global, "fetch")
      // create
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessel: { _id: "1" } }),
      } as Response)
      // refresh (useVessels)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response)
      // refresh (store)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response);

    ok = await api.createVessel({
      name: "Ship",
      description: "Desc",
      imageFile: fImg,
      objectFile: fObj,
      category: "Survey",
    });
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // ensure form fields are appended
    const keys = appendSpy.mock.calls.map((c) => c[0]);
    expect(keys).toEqual(
      expect.arrayContaining(["name", "description", "image", "object"])
    );
  });

  it("updateVessel posts only provided files and refreshes", async (): Promise<void> => {
    const api = useVessels();

    vi.spyOn(global, "fetch")
      // update
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessel: { _id: "1" } }),
      } as Response)
      // refresh (useVessels)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response)
      // refresh (store)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response);

    const appendSpy = vi.spyOn(FormData.prototype, "append");

    const ok = await api.updateVessel({
      _id: "1",
      name: "N",
      description: "D",
      imageFile: null,
      objectFile: null,
      category: "Survey",
    });
    expect(ok).toBe(true);
    const keys = appendSpy.mock.calls.map((c) => c[0]);
    expect(keys).toEqual(expect.arrayContaining(["name", "description"]));
    expect(keys).not.toEqual(expect.arrayContaining(["image", "object"]));
  });

  it("deleteVessel deletes and refreshes", async (): Promise<void> => {
    const api = useVessels();

    vi.spyOn(global, "fetch")
      // delete
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ message: "ok" }),
      } as Response)
      // refresh (useVessels)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response)
      // refresh (store)
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ vessels: [] }),
      } as Response);

    const ok = await api.deleteVessel("123");
    expect(ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
