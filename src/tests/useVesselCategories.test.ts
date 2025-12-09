/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
// Imports
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";

// Project imports
import { useVesselCategories } from "@/modules/vessels/useVesselCategories";
import { useVesselsStore } from "@/stores/vessels";
import type { VesselNavItem } from "@/stores/vessels";

// Mock the vessels store
vi.mock("@/stores/vessels");

describe("useVesselCategories", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  it("should return proper interface shape", (): void => {
    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>([]),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const result = useVesselCategories();

    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("loading");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("fetchCategories");
  });

  it("should group vessels by category", (): void => {
    const mockVessels: VesselNavItem[] = [
      {
        _id: "1",
        name: "Ship A",
        category: "Survey",
      },
      {
        _id: "2",
        name: "Ship B",
        category: "Maintenance",
      },
      {
        _id: "3",
        name: "Ship C",
        category: "Survey",
      },
    ];

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>(mockVessels),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value).toHaveLength(2);
    expect(categories.value.map((c): string => c.name)).toContain("Survey");
    expect(categories.value.map((c): string => c.name)).toContain(
      "Maintenance"
    );
  });

  it("should sort categories alphabetically", (): void => {
    const mockVessels: VesselNavItem[] = [
      {
        _id: "1",
        name: "Ship A",
        category: "Zebra",
      },
      {
        _id: "2",
        name: "Ship B",
        category: "Alpha",
      },
    ];

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>(mockVessels),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value[0].name).toBe("Alpha");
    expect(categories.value[1].name).toBe("Zebra");
  });

  it("should sort vessels within category alphabetically", (): void => {
    const mockVessels: VesselNavItem[] = [
      {
        _id: "1",
        name: "Zebra Ship",
        category: "Survey",
      },
      {
        _id: "2",
        name: "Alpha Ship",
        category: "Survey",
      },
    ];

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>(mockVessels),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value[0].vessels[0].name).toBe("Alpha Ship");
    expect(categories.value[0].vessels[1].name).toBe("Zebra Ship");
  });

  it("should toggle category open state", (): void => {
    const mockVessels: VesselNavItem[] = [
      {
        _id: "1",
        name: "Ship A",
        category: "Survey",
      },
    ];

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>(mockVessels),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();
    const category = categories.value[0];

    expect(category.isOpen.value).toBe(false);

    category.isOpen.value = true;
    expect(category.isOpen.value).toBe(true);

    category.isOpen.value = false;
    expect(category.isOpen.value).toBe(false);
  });

  it("should handle empty vessels", (): void => {
    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>([]),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value).toHaveLength(0);
  });

  it("should handle vessels without category as Uncategorized", (): void => {
    const mockVessels: VesselNavItem[] = [
      {
        _id: "1",
        name: "Ship A",
        category: "",
      },
      {
        _id: "2",
        name: "Ship B",
        category: "Survey",
      },
    ];

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>(mockVessels),
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value.map((c): string => c.name)).toContain(
      "Uncategorized"
    );
    expect(categories.value.map((c): string => c.name)).toContain("Survey");
  });

  it("should expose loading and error states", (): void => {
    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>([]),
      loading: ref(true),
      error: ref("Test error"),
      fetchVessels: vi.fn(),
    } as any);

    const { loading, error } = useVesselCategories();

    expect((loading as unknown as Ref<boolean>).value).toBe(true);
    expect((error as unknown as Ref<string>).value).toBe("Test error");
  });

  it("should call fetchVessels on fetchCategories", async (): Promise<void> => {
    const fetchMock = vi.fn();
    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: ref<VesselNavItem[]>([]),
      loading: false,
      error: null,
      fetchVessels: fetchMock,
    } as any);

    const { fetchCategories } = useVesselCategories();
    await fetchCategories();

    expect(fetchMock).toHaveBeenCalled();
  });

  it("should reactively update categories when vessels change", (): void => {
    const vesselsRef = ref<VesselNavItem[]>([
      {
        _id: "1",
        name: "Ship A",
        category: "Survey",
      },
    ]);

    vi.mocked(useVesselsStore).mockReturnValue({
      vessels: vesselsRef,
      loading: false,
      error: null,
      fetchVessels: vi.fn(),
    } as any);

    const { categories } = useVesselCategories();

    expect(categories.value).toHaveLength(1);
    expect(categories.value[0].name).toBe("Survey");

    // Update vessels
    vesselsRef.value.push({
      _id: "2",
      name: "Ship B",
      category: "Maintenance",
    });

    expect(categories.value).toHaveLength(2);
    expect(categories.value.map((c): string => c.name)).toContain(
      "Maintenance"
    );
  });
});
