// Imports
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

// Project imports
import VesselForm from "@/components/admin/VesselForm.vue";

vi.mock("@/utils/fileHelpers", (): object => ({
  createImagePreview: vi.fn(
    (): Promise<string> => Promise.resolve("data:image/png;base64,preview")
  ),
  formatFileSize: (n: number): string => `${n}B`,
}));

const makeFile = (name: string, type: string, size = 1024): File => {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
};

describe("VesselForm.vue", (): void => {
  const validateImageFile = vi.fn((_f: File | null): string | null => null);
  const validateObjectFile = vi.fn((_f: File | null): string | null => null);
  const getImageUrl = (p: string): string => `/api/img/${p}`;

  beforeEach((): void => {
    vi.clearAllMocks();
  });

  it("requires image/object in create mode and not in edit mode", (): void => {
    const wrapper = mount(VesselForm, {
      props: {
        loading: false,
        validateImageFile,
        validateObjectFile,
        getImageUrl,
      },
      attachTo: document.body,
    });

    const imgInput = wrapper.get("#image").element as HTMLInputElement;
    const objInput = wrapper.get("#object").element as HTMLInputElement;
    expect(imgInput.required).toBe(true);
    expect(objInput.required).toBe(true);

    const wrapperEdit = mount(VesselForm, {
      props: {
        loading: false,
        validateImageFile,
        validateObjectFile,
        getImageUrl,
        vessel: {
          _id: "1",
          name: "Aurora",
          description: "Desc",
          image: "a.jpg",
          object: "a.glb",
        },
      },
      attachTo: document.body,
    });

    expect(
      (wrapperEdit.get("#image").element as HTMLInputElement).required
    ).toBe(false);
    expect(
      (wrapperEdit.get("#object").element as HTMLInputElement).required
    ).toBe(false);
  });

  it("emits submit with form data when valid", async (): Promise<void> => {
    const wrapper = mount(VesselForm, {
      props: {
        loading: false,
        validateImageFile,
        validateObjectFile,
        getImageUrl,
      },
      attachTo: document.body,
    });

    await wrapper.get("#name").setValue("Ship");
    await wrapper.get("#description").setValue("Desc");

    const img = makeFile("img.png", "image/png");
    const obj = makeFile("m.glb", "application/octet-stream");

    const imgEl = wrapper.get("#image").element as HTMLInputElement;
    Object.defineProperty(imgEl, "files", { value: [img] });
    await wrapper.get("#image").trigger("change");

    const objEl = wrapper.get("#object").element as HTMLInputElement;
    Object.defineProperty(objEl, "files", { value: [obj] });
    await wrapper.get("#object").trigger("change");

    await wrapper.find("form").trigger("submit.prevent");

    const emits = wrapper.emitted("submit");
    expect(emits).toBeTruthy();
    if (emits) {
      const payload = emits[0][0] as Record<string, unknown>;
      expect(payload.name).toBe("Ship");
      expect(payload.description).toBe("Desc");
      expect(payload.imageFile).toBeInstanceOf(File);
      expect(payload.objectFile).toBeInstanceOf(File);
    }
  });

  it("shows validation errors from validators", async (): Promise<void> => {
    validateImageFile.mockReturnValueOnce("Bad image");
    const wrapper = mount(VesselForm, {
      props: {
        loading: false,
        validateImageFile,
        validateObjectFile,
        getImageUrl,
      },
      attachTo: document.body,
    });

    const badImg = makeFile("img.bmp", "image/bmp");
    const imgEl = wrapper.get("#image").element as HTMLInputElement;
    Object.defineProperty(imgEl, "files", { value: [badImg] });
    await wrapper.get("#image").trigger("change");

    expect(wrapper.text()).toContain("Bad image");
  });

  it("renders current image in edit mode when no new image selected", (): void => {
    const wrapper = mount(VesselForm, {
      props: {
        loading: false,
        validateImageFile,
        validateObjectFile,
        getImageUrl,
        vessel: {
          _id: "1",
          name: "Aurora",
          description: "Desc",
          image: "a.jpg",
          object: "a.glb",
        },
      },
    });

    expect(wrapper.text()).toContain("Current: a.jpg");
    const img = wrapper.find("img[alt='Aurora']");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toContain("/api/img/");
  });
});
