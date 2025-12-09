// Imports
import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

// Project imports
import { useVesselsStore } from "@/stores/vessels";
import type { VesselNavItem } from "@/stores/vessels";

export interface VesselCategory {
  name: string;
  vessels: VesselNavItem[];
  isOpen: Ref<boolean>;
}

export interface UseVesselCategoriesReturn {
  categories: ComputedRef<VesselCategory[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchCategories: () => Promise<void>;
}

export const useVesselCategories = (): UseVesselCategoriesReturn => {
  const store = useVesselsStore();
  const categoryStates = ref<Record<string, boolean>>({});

  const categories = computed<VesselCategory[]>(() => {
    // Group vessels by category
    const grouped = new Map<string, VesselNavItem[]>();

    const vesselsList = Array.isArray(store.vessels)
      ? store.vessels
      : (store.vessels as unknown as { value: VesselNavItem[] }).value;

    vesselsList.forEach((vessel: VesselNavItem): void => {
      const category = vessel.category || "Uncategorized";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)?.push(vessel);
    });

    // Convert to array and sort categories alphabetically
    const result: VesselCategory[] = Array.from(grouped.entries())
      .map(
        ([name, vesselList]: [string, VesselNavItem[]]): VesselCategory => ({
          name,
          // Sort vessels within category alphabetically by name
          vessels: vesselList.sort(
            (a: VesselNavItem, b: VesselNavItem): number =>
              a.name.localeCompare(b.name)
          ),
          // Initialize open state, default to false
          isOpen: ref<boolean>(categoryStates.value[name] ?? false),
        })
      )
      // Sort categories alphabetically
      .sort((a: VesselCategory, b: VesselCategory): number =>
        a.name.localeCompare(b.name)
      );

    return result;
  });

  const fetchCategories = async (): Promise<void> => {
    await store.fetchVessels();
  };

  return {
    categories,
    loading: store.loading as unknown as Ref<boolean>,
    error: store.error as unknown as Ref<string | null>,
    fetchCategories,
  };
};
