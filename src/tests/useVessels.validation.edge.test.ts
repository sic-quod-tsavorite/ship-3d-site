// Imports
import { describe, it, expect } from "vitest";

// Project imports
import { useVessels } from "@/modules/vessels/useVessels";

const mk = (name: string, type: string, size: number): File =>
  new File([new Blob(["x".repeat(size)], { type })], name, { type });

describe("useVessels – validation exact limits and extensions", (): void => {
  it("accepts files exactly at size limits", { timeout: 10000 }, (): void => {
    const api = useVessels();

    // 10MB image
    const tenMB = 10 * 1024 * 1024;
    expect(api.validateImageFile(mk("a.png", "image/png", tenMB))).toBeNull();

    // 50MB object
    const fiftyMB = 50 * 1024 * 1024;
    expect(
      api.validateObjectFile(mk("m.glb", "application/octet-stream", fiftyMB))
    ).toBeNull();
  });

  it("accepts uppercase GLB/GLTF extensions", (): void => {
    const api = useVessels();

    expect(
      api.validateObjectFile(mk("MODEL.GLB", "application/octet-stream", 100))
    ).toBeNull();
    expect(
      api.validateObjectFile(mk("ship.GLTF", "model/gltf+json", 100))
    ).toBeNull();
  });
});
