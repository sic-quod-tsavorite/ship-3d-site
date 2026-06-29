// Imports
import { ref } from "vue";
import type { Ref } from "vue";

// Project imports
import type {
  Vessel,
  VesselFormData,
  VesselUpdateData,
} from "@/interfaces/vesselInterfaces";
import { staticVessels } from "@/data/staticVessels";

export const useVessels = (): {
  vessels: Ref<Vessel[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchVessels: () => Promise<void>;
  createVessel: (formData: VesselFormData) => Promise<boolean>;
  updateVessel: (updateData: VesselUpdateData) => Promise<boolean>;
  deleteVessel: (id: string) => Promise<boolean>;
  validateImageFile: (file: File | null) => string | null;
  validateObjectFile: (file: File | null) => string | null;
  getImageUrl: (imagePath: string) => string;
  getObjectUrl: (objectPath: string) => string;
} => {
  const vessels = ref<Vessel[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_OBJECT_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
  const ALLOWED_OBJECT_EXTENSIONS = [".glb", ".gltf"];

  const validateImageFile = (file: File | null): string | null => {
    if (!file) return null;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Image must be PNG, JPEG, or WebP format";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Image size must not exceed 10MB";
    }

    return null;
  };

  const validateObjectFile = (file: File | null): string | null => {
    if (!file) return null;

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_OBJECT_EXTENSIONS.includes(extension)) {
      return "3D model must be GLB or GLTF format";
    }

    if (file.size > MAX_OBJECT_SIZE) {
      return "3D model size must not exceed 50MB";
    }

    return null;
  };

  const getImageUrl = (imagePath: string): string => {
    return imagePath;
  };

  const getObjectUrl = (objectPath: string): string => {
    return objectPath;
  };

  const fetchVessels = (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      vessels.value = staticVessels;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      vessels.value = [];
    } finally {
      loading.value = false;
    }
    return Promise.resolve();
  };

  const createVessel = (_formData: VesselFormData): Promise<boolean> => {
    return Promise.resolve(false);
  };

  const updateVessel = (_updateData: VesselUpdateData): Promise<boolean> => {
    return Promise.resolve(false);
  };

  const deleteVessel = (_id: string): Promise<boolean> => {
    return Promise.resolve(false);
  };

  return {
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
  };
};
