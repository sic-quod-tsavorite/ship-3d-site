// Imports
import { describe, it, expect } from "vitest";
import { ref } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import { useVesselList } from "@/modules/vessels/useVesselList";

const vessels: Vessel[] = [
  {
    _id: "1",
    name: "Café 🚢 (测试)",
    description: "Crème brûlée",
    image: "a.jpg",
    object: "a.glb",
  },
  {
    _id: "2",
    name: "Niñø",
    description: "Piñåtæ & jalapeño",
    image: "b.jpg",
    object: "b.glb",
  },
  {
    _id: "3",
    name: "普通话",
    description: "漢字",
    image: "c.jpg",
    object: "c.glb",
  },
];

describe("useVesselList – Unicode and special characters", (): void => {
  it("matches queries with emoji and symbols", (): void => {
    const api = useVesselList(ref([...vessels]));

    api.searchQuery.value = "🚢";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["1"]);

    api.searchQuery.value = "(";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["1"]);
  });

  it("matches names/descriptions with diacritics when query includes them", (): void => {
    const api = useVesselList(ref([...vessels]));

    api.searchQuery.value = "café"; // exact diacritic
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["1"]);

    api.searchQuery.value = "brûlée";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["1"]);

    api.searchQuery.value = "niñø";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["2"]);
  });

  it("handles CJK and other scripts", (): void => {
    const api = useVesselList(ref([...vessels]));
    api.searchQuery.value = "普通";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["3"]);
    api.searchQuery.value = "漢字";
    expect(api.filteredAndSortedVessels.value.map((v) => v._id)).toEqual(["3"]);
  });
});
