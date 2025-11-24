// Imports
import { ref } from "vue";
import type { Ref } from "vue";

// Project imports
import type {
  Vessel,
  VesselFormData,
  VesselUpdateData,
  VesselResponse,
  VesselErrorResponse,
} from "@/interfaces/vesselInterfaces";

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
  const API_URL = import.meta.env.VITE_API_URL as string;
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
        | { data: Vessel[] }
        | { vessel: Vessel }
        | { error?: string; message?: string };
      // console.debug("[vessels] raw fetch response", raw);

      if (!response.ok) {
        let errorMessage = "Failed to fetch vessels";
        if (
          typeof raw === "object" &&
          "error" in raw &&
          typeof raw.error === "string"
        ) {
          errorMessage = raw.error;
        } else if (
          typeof raw === "object" &&
          "message" in raw &&
          typeof raw.message === "string"
        ) {
          errorMessage = raw.message;
        }
        throw new Error(errorMessage);
      }

      let list: Vessel[] = [];
      // Accept several shapes: array root, { vessels: [] }, { data: [] }
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
      } else if (
        typeof raw === "object" &&
        "vessel" in raw &&
        typeof raw.vessel === "object"
      ) {
        // Single vessel returned; wrap in array
        list = [raw.vessel];
      }

      vessels.value = list;
      // console.debug("[vessels] parsed list length", list.length);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      vessels.value = [];
      // console.error("[vessels] fetch error", error.value);
    } finally {
      loading.value = false;
    }
  };

  const createVessel = async (formData: VesselFormData): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    // Validate files
    if (!formData.imageFile) {
      error.value = "Image is required";
      loading.value = false;
      return false;
    }

    if (!formData.objectFile) {
      error.value = "3D model is required";
      loading.value = false;
      return false;
    }

    const imageError = validateImageFile(formData.imageFile);
    if (imageError) {
      error.value = imageError;
      loading.value = false;
      return false;
    }

    const objectError = validateObjectFile(formData.objectFile);
    if (objectError) {
      error.value = objectError;
      loading.value = false;
      return false;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("image", formData.imageFile);
      formDataToSend.append("object", formData.objectFile);

      const response = await fetch(`${API_URL}/vessels`, {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const data = (await response.json()) as
        | VesselResponse
        | VesselErrorResponse;

      if (!response.ok) {
        const errorResponse = data as VesselErrorResponse;
        throw new Error(errorResponse.error || "Failed to create vessel");
      }

      await fetchVessels();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateVessel = async (
    updateData: VesselUpdateData
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    // Validate files if provided
    if (updateData.imageFile) {
      const imageError = validateImageFile(updateData.imageFile);
      if (imageError) {
        error.value = imageError;
        loading.value = false;
        return false;
      }
    }

    if (updateData.objectFile) {
      const objectError = validateObjectFile(updateData.objectFile);
      if (objectError) {
        error.value = objectError;
        loading.value = false;
        return false;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", updateData.name);
      formDataToSend.append("description", updateData.description);

      if (updateData.imageFile) {
        formDataToSend.append("image", updateData.imageFile);
      }

      if (updateData.objectFile) {
        formDataToSend.append("object", updateData.objectFile);
      }

      const response = await fetch(`${API_URL}/vessels/${updateData._id}`, {
        method: "PUT",
        body: formDataToSend,
        credentials: "include",
      });

      const data = (await response.json()) as
        | VesselResponse
        | VesselErrorResponse;

      if (!response.ok) {
        const errorResponse = data as VesselErrorResponse;
        throw new Error(errorResponse.error || "Failed to update vessel");
      }

      await fetchVessels();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteVessel = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/vessels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json()) as
        | VesselResponse
        | VesselErrorResponse;

      if (!response.ok) {
        const errorResponse = data as VesselErrorResponse;
        throw new Error(errorResponse.error || "Failed to delete vessel");
      }

      await fetchVessels();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
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
