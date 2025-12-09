// Imports
import { defineStore } from "pinia";
import { ref } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";

export interface VesselNavItem {
  _id: string;
  name: string;
  category: string;
}

export const useVesselsStore = defineStore("vessels", () => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const vessels = ref<VesselNavItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchVessels = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_URL}/vessels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const raw = (await response.json()) as
        | Vessel[]
        | { vessels: Vessel[] }
        | { data: Vessel[] };

      if (!response.ok) {
        throw new Error("Failed to fetch vessels");
      }

      let list: Vessel[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (
        typeof raw === "object" &&
        "vessels" in raw &&
        Array.isArray(raw.vessels)
      ) {
        list = raw.vessels;
      } else if (
        typeof raw === "object" &&
        "data" in raw &&
        Array.isArray(raw.data)
      ) {
        list = raw.data;
      }

      // Extract only name and category
      vessels.value = list.map(
        (vessel: Vessel): VesselNavItem => ({
          _id: vessel._id,
          name: vessel.name,
          category: vessel.category || "Uncategorized",
        })
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      vessels.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    vessels,
    loading,
    error,
    fetchVessels,
  };
});
