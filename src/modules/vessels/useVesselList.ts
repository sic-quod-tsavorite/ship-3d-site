import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { Vessel } from "@/interfaces/vesselInterfaces";

export const useVesselList = (
  vessels: Ref<Vessel[]>
): {
  searchQuery: Ref<string>;
  sortField: Ref<"name" | null>;
  sortDirection: Ref<"asc" | "desc">;
  selectedIds: Ref<Set<string>>;
  selectedModel: Ref<Vessel | null>;
  filteredAndSortedVessels: ComputedRef<Vessel[]>;
  allSelected: ComputedRef<boolean>;
  someSelected: ComputedRef<boolean>;
  toggleSelection: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  toggleSort: (field: "name") => void;
  openModelViewer: (vessel: Vessel) => void;
  closeModelViewer: () => void;
} => {
  // State
  const searchQuery = ref<string>("");
  const sortField = ref<"name" | null>("name");
  const sortDirection = ref<"asc" | "desc">("asc");
  const selectedIds = ref<Set<string>>(new Set());
  const selectedModel = ref<Vessel | null>(null);

  // Computed: filtered and sorted vessels
  const filteredAndSortedVessels = computed(() => {
    let result = [...vessels.value];

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortField.value) {
      result.sort((a, b) => {
        const fieldName = sortField.value;
        if (fieldName === null) return 0;
        const aVal = a[fieldName].toLowerCase();
        const bVal = b[fieldName].toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return sortDirection.value === "asc" ? comparison : -comparison;
      });
    }

    return result;
  });

  // Computed: selection states
  const allSelected = computed(() => {
    return (
      filteredAndSortedVessels.value.length > 0 &&
      filteredAndSortedVessels.value.every((v) => selectedIds.value.has(v._id))
    );
  });

  const someSelected = computed(() => {
    const selected = filteredAndSortedVessels.value.some((v) =>
      selectedIds.value.has(v._id)
    );
    return selected && !allSelected.value;
  });

  // Selection handlers
  const toggleSelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  };

  const toggleSelectAll = (): void => {
    if (allSelected.value) {
      // Deselect all
      filteredAndSortedVessels.value.forEach((v) =>
        selectedIds.value.delete(v._id)
      );
    } else {
      // Select all
      filteredAndSortedVessels.value.forEach((v) =>
        selectedIds.value.add(v._id)
      );
    }
  };

  const clearSelection = (): void => {
    selectedIds.value.clear();
  };

  // Sort handler
  const toggleSort = (field: "name"): void => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
      sortField.value = field;
      sortDirection.value = "asc";
    }
  };

  // 3D Model viewer handlers
  const openModelViewer = (vessel: Vessel): void => {
    selectedModel.value = vessel;
  };

  const closeModelViewer = (): void => {
    selectedModel.value = null;
  };

  return {
    // State
    searchQuery,
    sortField,
    sortDirection,
    selectedIds,
    selectedModel,

    // Computed
    filteredAndSortedVessels,
    allSelected,
    someSelected,

    // Methods
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    toggleSort,
    openModelViewer,
    closeModelViewer,
  };
};
