// Imports
import { defineStore } from "pinia";
import { ref } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import { staticVessels } from "@/data/staticVessels";

export interface VesselNavItem {
  _id: string;
  name: string;
  category: string;
}

export const useVesselsStore = defineStore("vessels", () => {
  const vessels = ref<VesselNavItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchVessels = (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      vessels.value = staticVessels.map((vessel: Vessel): VesselNavItem => ({
        _id: vessel._id,
        name: vessel.name,
        category: vessel.category || "Uncategorized",
      }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      vessels.value = [];
    } finally {
      loading.value = false;
    }
    return Promise.resolve();
  };

  return {
    vessels,
    loading,
    error,
    fetchVessels,
  };
});
