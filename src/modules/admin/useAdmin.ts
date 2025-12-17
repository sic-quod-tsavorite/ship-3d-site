// Imports
import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";

// Project imports
import { useAuthStore } from "@/stores/auth";
import { useVessels } from "@/modules/vessels/useVessels";
import type { Vessel } from "@/interfaces/vesselInterfaces";

/**
 * Composable for admin logic
 * Handles vessel CRUD operations and form state management
 */
export const useAdmin = (): {
  auth: ReturnType<typeof useAuthStore>;
  vessels: Ref<Vessel[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  showForm: Ref<boolean>;
  selectedVessel: Ref<Vessel | undefined>;
  validateImageFile: (file: File | null) => string | null;
  validateObjectFile: (file: File | null) => string | null;
  getImageUrl: (filename: string) => string;
  getObjectUrl: (filename: string) => string;
  openCreateForm: () => void;
  openEditForm: (vessel: Vessel) => void;
  closeForm: () => void;
  handleSubmit: (data: {
    name: string;
    description: string;
    imageFile: File | null;
    objectFile: File | null;
    category: string;
  }) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleBatchDelete: (ids: string[]) => Promise<void>;
} => {
  const router = useRouter();
  const auth = useAuthStore();

  const {
    vessels,
    loading,
    error,
    fetchVessels,
    createVessel,
    updateVessel,
    deleteVessel,
    validateImageFile,
    validateObjectFile,
    getImageUrl,
    getObjectUrl,
  } = useVessels();

  // Form state
  const showForm = ref<boolean>(false);
  const selectedVessel = ref<Vessel | undefined>(undefined);

  // Session check interval (check every 60 seconds)
  const SESSION_CHECK_INTERVAL = 60 * 1000;
  let sessionCheckTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize admin view - check auth and fetch vessels
   */
  const initializeAdminView = async (): Promise<void> => {
    if (!auth.isLoggedIn) {
      await router.push("/login");
    } else {
      await fetchVessels();
    }
  };

  /**
   * Periodically check if session is still valid
   * Redirects to login if session has expired
   */
  const startSessionCheck = (): void => {
    sessionCheckTimer = setInterval((): void => {
      const checkSession = async (): Promise<void> => {
        await auth.initAuth();
        if (!auth.isLoggedIn) {
          stopSessionCheck();
          await router.push("/login");
        }
      };
      void checkSession();
    }, SESSION_CHECK_INTERVAL);
  };

  /**
   * Stop the session check interval
   */
  const stopSessionCheck = (): void => {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
      sessionCheckTimer = null;
    }
  };

  /**
   * Watch for auth changes and refetch vessels when logged in
   * Redirects to login if session expires
   */
  const setupAuthWatcher = (): void => {
    watch(
      () => auth.isLoggedIn,
      async (val) => {
        if (val) {
          await fetchVessels();
        } else {
          // Session expired - redirect to login
          stopSessionCheck();
          await router.push("/login");
        }
      },
      { immediate: false }
    );
  };

  /**
   * Opens the form for creating a new vessel
   */
  const openCreateForm = (): void => {
    selectedVessel.value = undefined;
    showForm.value = true;
  };

  /**
   * Opens the form for editing an existing vessel
   */
  const openEditForm = (vessel: Vessel): void => {
    selectedVessel.value = vessel;
    showForm.value = true;
  };

  /**
   * Closes the vessel form and clears selection
   */
  const closeForm = (): void => {
    showForm.value = false;
    selectedVessel.value = undefined;
  };

  /**
   * Handles vessel form submission (create or update)
   */
  const handleSubmit = async (data: {
    name: string;
    description: string;
    imageFile: File | null;
    objectFile: File | null;
    category: string;
  }): Promise<void> => {
    let success = false;

    if (selectedVessel.value) {
      // Update existing vessel
      success = await updateVessel({
        _id: selectedVessel.value._id,
        name: data.name,
        description: data.description,
        imageFile: data.imageFile,
        objectFile: data.objectFile,
        category: data.category,
      });
    } else {
      // Create new vessel
      success = await createVessel({
        name: data.name,
        description: data.description,
        imageFile: data.imageFile,
        objectFile: data.objectFile,
        category: data.category,
      });
    }

    if (success) {
      closeForm();
    }
  };

  /**
   * Handles single vessel deletion
   */
  const handleDelete = async (id: string): Promise<void> => {
    await deleteVessel(id);
  };

  /**
   * Handles batch deletion of vessels
   */
  const handleBatchDelete = async (ids: string[]): Promise<void> => {
    for (const id of ids) {
      await deleteVessel(id);
    }
  };

  // Initialize on mount
  onMounted(async () => {
    await initializeAdminView();
    setupAuthWatcher();
    startSessionCheck();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopSessionCheck();
  });

  return {
    // Auth state
    auth,

    // Vessel data
    vessels,
    loading,
    error,

    // Form state
    showForm,
    selectedVessel,

    // Vessel utilities
    validateImageFile,
    validateObjectFile,
    getImageUrl,
    getObjectUrl,

    // Actions
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
    handleBatchDelete,
  };
};
