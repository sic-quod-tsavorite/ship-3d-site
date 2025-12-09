// Imports
import { computed } from "vue";
import type { ComputedRef, Ref } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";

export interface UseCategoryListReturn {
  categories: ComputedRef<string[]>;
}

export const useCategoryList = (
  vessels: Ref<Vessel[]>
): UseCategoryListReturn => {
  const categories = computed<string[]>(() => {
    const uniqueCategories = new Set<string>();

    vessels.value.forEach((v: Vessel): void => {
      if (v.category) {
        uniqueCategories.add(v.category.trim());
      }
    });

    // Sort alphabetically
    return Array.from(uniqueCategories).sort((a: string, b: string): number =>
      a.localeCompare(b)
    );
  });

  return { categories };
};
