// Imports
import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";

// Project imports
import { useVesselForm } from "@/modules/vessels/useVesselForm";
import type { Vessel } from "@/interfaces/vesselInterfaces";

vi.mock("@/utils/fileHelpers", () => ({
  createImagePreview: vi.fn((file: File): Promise<string> =>
    Promise.resolve(`data:image;base64,mock-${file.name}`)
  ),
}));

describe("useVesselForm", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  it("initializes empty for create mode", (): void => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            undefined,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    const { formData, imagePreview, isEditMode } = wrapper.vm;
    expect(isEditMode).toBe(false);
    expect(formData.name).toBe("");
    expect(formData.description).toBe("");
    expect(formData.imageFile).toBeNull();
    expect(formData.objectFile).toBeNull();
    expect(imagePreview).toBeNull();
  });

  it("initializes from existing vessel for edit mode", async (): Promise<void> => {
    const vessel: Vessel = {
      _id: "1",
      name: "Ship A",
      description: "Description A",
      image: "ship.jpg",
      object: "ship.glb",
      category: "Survey",
    };

    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            vessel,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    await nextTick();

    const { formData, isEditMode } = wrapper.vm;
    expect(isEditMode).toBe(true);
    expect(formData.name).toBe("Ship A");
    expect(formData.description).toBe("Description A");
  });

  it("validates required image and object for create mode", (): void => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            undefined,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    const { validateForm, submitError } = wrapper.vm;
    const valid = validateForm();
    expect(valid).toBe(false);
    if (submitError) {
      expect(submitError).toContain("required");
    }
  });

  it("validates image files using provided validator", async (): Promise<void> => {
    const mockValidator = vi.fn((file: File | null): string | null =>
      file?.name === "bad.png" ? "Invalid image" : null
    );

    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(undefined, mockValidator, (): null => null);
        },
        template: "<div></div>",
      })
    );

    const { handleImageChange, imageError, formData } = wrapper.vm;

    const badFile = new File(["x"], "bad.png", { type: "image/png" });
    const event = {
      target: { files: [badFile], value: "" },
    } as unknown as Event;
    await handleImageChange(event);
    await nextTick();

    expect(mockValidator).toHaveBeenCalledWith(badFile);
    if (imageError) {
      expect(imageError).toBe("Invalid image");
    }
    expect(formData.imageFile).toBeNull();
  });

  it("validates object files using provided validator", (): void => {
    const mockValidator = vi.fn((file: File | null): string | null =>
      file?.name === "bad.glb" ? "Invalid object" : null
    );

    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(undefined, (): null => null, mockValidator);
        },
        template: "<div></div>",
      })
    );

    const { handleObjectChange, objectError, formData } = wrapper.vm;

    const badFile = new File(["x"], "bad.glb", {
      type: "application/octet-stream",
    });
    const event = {
      target: { files: [badFile], value: "" },
    } as unknown as Event;
    handleObjectChange(event);

    expect(mockValidator).toHaveBeenCalledWith(badFile);
    if (objectError) {
      expect(objectError).toBe("Invalid object");
    }
    expect(formData.objectFile).toBeNull();
  });

  it("creates image preview when valid file is selected", async (): Promise<void> => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            undefined,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    const { handleImageChange, imagePreview, formData } = wrapper.vm;

    const file = new File(["x"], "test.png", { type: "image/png" });
    const event = {
      target: { files: [file], value: "" },
    } as unknown as Event;
    await handleImageChange(event);
    await nextTick();

    expect(formData.imageFile).toBe(file);
    if (imagePreview) {
      expect(imagePreview).toContain("mock-test.png");
    }
  });

  it("handles null file inputs by clearing preview", async (): Promise<void> => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            undefined,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    const { handleImageChange, handleObjectChange, imagePreview, formData } =
      wrapper.vm;

    // Set a file first
    const file = new File(["x"], "a.png", { type: "image/png" });
    const event = {
      target: { files: [file], value: "" },
    } as unknown as Event;
    await handleImageChange(event);
    await nextTick();
    expect(formData.imageFile).toBe(file);

    // Now clear it
    const clearEvent = {
      target: { files: [], value: "" },
    } as unknown as Event;
    await handleImageChange(clearEvent);
    expect(formData.imageFile).toBeNull();
    expect(imagePreview).toBeNull();

    // Same for object
    const objFile = new File(["x"], "m.glb", {
      type: "application/octet-stream",
    });
    const objEvent = {
      target: { files: [objFile], value: "" },
    } as unknown as Event;
    handleObjectChange(objEvent);
    expect(formData.objectFile).toBe(objFile);

    const clearObjEvent = {
      target: { files: [], value: "" },
    } as unknown as Event;
    handleObjectChange(clearObjEvent);
    expect(formData.objectFile).toBeNull();
  });

  it("returns correct data structure from getFormData", async (): Promise<void> => {
    const vessel: Vessel = {
      _id: "1",
      name: "Ship",
      description: "Desc",
      image: "ship.jpg",
      object: "ship.glb",
      category: "Survey",
    };

    const wrapper = mount(
      defineComponent({
        setup() {
          return useVesselForm(
            vessel,
            (): null => null,
            (): null => null
          );
        },
        template: "<div></div>",
      })
    );

    await nextTick();

    const { formData, getFormData } = wrapper.vm;

    formData.name = "Updated";
    const imgFile = new File(["x"], "new.png", { type: "image/png" });
    formData.imageFile = imgFile;

    const data = getFormData();

    expect(data.name).toBe("Updated");
    expect(data.description).toBe("Desc");
    expect(data.imageFile).toBe(imgFile);
    expect(data.objectFile).toBeNull();
  });
});
