// Imports
import { describe, it, expect } from "vitest";
import { ref } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import { useVesselList } from "@/modules/vessels/useVesselList";

const vesselsSample: Vessel[] = [
  {
    _id: "1",
    name: "Aurora",
    description: "Alpha ship",
    image: "a.jpg",
    object: "a.glb",
    category: "Survey",
  },
  {
    _id: "2",
    name: "Zephyr",
    description: "Beta ship",
    image: "z.jpg",
    object: "z.glb",
    category: "Maintenance",
  },
  {
    _id: "3",
    name: "Borealis",
    description: "Gamma ship",
    image: "b.jpg",
    object: "b.glb",
    category: "Survey",
  },
];

describe("useVesselList", (): void => {
  it("filters by search query across name and description", (): void => {
    const api = useVesselList(ref([...vesselsSample]));

    api.searchQuery.value = "aur";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["1"]);

    api.searchQuery.value = "ship"; // matches description on all
    expect(api.filteredAndSortedVessels.value.length).toBe(3);

    api.searchQuery.value = "gamma";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["3"]);
  });

  it("sorts by name and toggles direction", (): void => {
    const api = useVesselList(ref([...vesselsSample]));

    // default is sort by name asc
    expect(api.filteredAndSortedVessels.value.map((v) => v.name)).toEqual([
      "Aurora",
      "Borealis",
      "Zephyr",
    ]);

    api.toggleSort("name"); // switch to desc
    expect(api.filteredAndSortedVessels.value.map((v) => v.name)).toEqual([
      "Zephyr",
      "Borealis",
      "Aurora",
    ]);

    api.toggleSort("name"); // back to asc
    expect(api.filteredAndSortedVessels.value.map((v) => v.name)).toEqual([
      "Aurora",
      "Borealis",
      "Zephyr",
    ]);
  });

  it("selection toggles and select-all respects current filter", (): void => {
    const api = useVesselList(ref([...vesselsSample]));

    // filter to two items ("or" matches Aurora and Borealis only)
    api.searchQuery.value = "or";
    const filteredIds = api.filteredAndSortedVessels.value.map((v) => v._id);
    expect(filteredIds).toEqual(["1", "3"]);

    // select-all selects only filtered
    api.toggleSelectAll();
    expect(api.allSelected.value).toBe(true);
    expect(api.selectedIds.value.has("1")).toBe(true);
    expect(api.selectedIds.value.has("3")).toBe(true);
    expect(api.selectedIds.value.has("2")).toBe(false);

    // deselect all
    api.toggleSelectAll();
    expect(api.selectedIds.value.size).toBe(0);

    // toggle individual selection
    api.toggleSelection("2");
    expect(api.selectedIds.value.has("2")).toBe(true);

    api.clearSelection();
    expect(api.selectedIds.value.size).toBe(0);
  });

  it("opens and closes model viewer", (): void => {
    const api = useVesselList(ref([...vesselsSample]));
    expect(api.selectedModel.value).toBeNull();
    api.openModelViewer(vesselsSample[0]);
    expect(api.selectedModel.value?._id).toBe("1");
    api.closeModelViewer();
    expect(api.selectedModel.value).toBeNull();
  });
});
