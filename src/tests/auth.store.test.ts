import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

// Mock router push used by logout
vi.mock("@/router", () => ({
  default: { push: vi.fn(async () => {}) },
}));

describe("auth store – network and JSON errors", (): void => {
  beforeEach((): void => {
    setActivePinia(createPinia());
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.restoreAllMocks();
  });

  afterEach((): void => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("initAuth sets logged out on non-ok or unauthenticated payload", async (): Promise<void> => {
    const store = useAuthStore();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ isAuthenticated: false }),
    } as Response);
    await store.initAuth();
    expect(store.isLoggedIn).toBe(false);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    } as Response);
    await store.initAuth();
    expect(store.isLoggedIn).toBe(false);
  });

  it("initAuth handles fetch rejection and malformed JSON", async (): Promise<void> => {
    const store = useAuthStore();
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));
    await store.initAuth();
    expect(store.isLoggedIn).toBe(false);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: (): Promise<unknown> => Promise.reject(new Error("Bad JSON")),
    } as Response);
    await store.initAuth();
    expect(store.isLoggedIn).toBe(false);
  });

  it("logout navigates to /login even when request fails", async (): Promise<void> => {
    const store = useAuthStore();
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("network"));
    const router = (await import("@/router")).default as {
      push: (p: string) => Promise<void>;
    };

    await store.logout();
    expect(fetchSpy).toHaveBeenCalled();
    expect(store.isLoggedIn).toBe(false);
    expect(router.push).toHaveBeenCalledWith("/login");
  });
});
