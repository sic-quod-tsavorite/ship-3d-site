// Imports
import {
  ref,
  reactive,
  computed,
  onMounted,
  type Ref,
  type ComputedRef,
} from "vue";

// Project imports
import type { Vessel, VesselFormData } from "@/interfaces/vesselInterfaces";
import { createImagePreview } from "@/utils/fileHelpers";

export const useVesselForm = (
  vessel: Vessel | undefined,
  validateImageFile: (file: File | null) => string | null,
  validateObjectFile: (file: File | null) => string | null
): {
  isEditMode: ComputedRef<boolean>;
  formData: VesselFormData;
  imagePreview: Ref<string | null>;
  imageError: Ref<string | null>;
  objectError: Ref<string | null>;
  submitError: Ref<string | null>;
  handleImageChange: (event: Event) => Promise<void>;
  handleObjectChange: (event: Event) => void;
  validateForm: () => boolean;
  getFormData: () => VesselFormData;
} => {
  const isEditMode = computed(() => !!vessel);

  const formData = reactive<VesselFormData>({
    name: "",
    description: "",
    imageFile: null,
    objectFile: null,
  });

  const imagePreview = ref<string | null>(null);
  const imageError = ref<string | null>(null);
  const objectError = ref<string | null>(null);
  const submitError = ref<string | null>(null);

  // Initialize form data if editing
  onMounted(() => {
    if (vessel) {
      formData.name = vessel.name;
      formData.description = vessel.description;
    }
  });

  const handleImageChange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    formData.imageFile = file;
    imageError.value = null;
    submitError.value = null;

    if (file) {
      const error = validateImageFile(file);
      if (error) {
        imageError.value = error;
        formData.imageFile = null;
        target.value = "";
        return;
      }

      try {
        imagePreview.value = await createImagePreview(file);
      } catch (err) {
        console.error("Failed to create image preview:", err);
        imagePreview.value = null;
      }
    } else {
      imagePreview.value = null;
    }
  };

  const handleObjectChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    formData.objectFile = file;
    objectError.value = null;
    submitError.value = null;

    if (file) {
      const error = validateObjectFile(file);
      if (error) {
        objectError.value = error;
        formData.objectFile = null;
        target.value = "";
      }
    }
  };

  const validateForm = (): boolean => {
    imageError.value = null;
    objectError.value = null;
    submitError.value = null;

    // Validate required fields for create mode
    if (!isEditMode.value) {
      if (!formData.imageFile) {
        submitError.value = "Image is required";
        return false;
      }
      if (!formData.objectFile) {
        submitError.value = "3D model is required";
        return false;
      }
    }

    // Validate files if provided
    if (formData.imageFile) {
      const error = validateImageFile(formData.imageFile);
      if (error) {
        imageError.value = error;
        submitError.value = "Please fix the errors before submitting";
        return false;
      }
    }

    if (formData.objectFile) {
      const error = validateObjectFile(formData.objectFile);
      if (error) {
        objectError.value = error;
        submitError.value = "Please fix the errors before submitting";
        return false;
      }
    }

    return true;
  };

  const getFormData = (): VesselFormData => {
    return {
      name: formData.name,
      description: formData.description,
      imageFile: formData.imageFile,
      objectFile: formData.objectFile,
    };
  };

  return {
    // State
    isEditMode,
    formData,
    imagePreview,
    imageError,
    objectError,
    submitError,

    // Methods
    handleImageChange,
    handleObjectChange,
    validateForm,
    getFormData,
  };
};
