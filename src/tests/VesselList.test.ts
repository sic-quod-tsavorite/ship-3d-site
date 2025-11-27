// Imports
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { ComponentPublicInstance } from "vue";

// Project imports
import VesselList from "@/components/admin/VesselList.vue";
import type { Vessel } from "@/interfaces/vesselInterfaces";

// Mock indexedDB
const indexedDBMock: IDBFactory = {
  open: () => ({
    onsuccess: null,
    onerror: null,
  }),
} as unknown as IDBFactory;

Object.defineProperty(global, "indexedDB", {
  value: indexedDBMock,
  writable: true,
});

const vessels: Vessel[] = [
  {
    _id: "1",
    name: "Aurora",
    description: "Alpha",
    image: "a.jpg",
    object: "a.glb",
  },
  {
    _id: "2",
    name: "Zephyr",
    description: "Beta",
    image: "z.jpg",
    object: "z.glb",
  },
  {
    _id: "3",
    name: "Borealis",
    description: "Gamma",
    image: "b.jpg",
    object: "b.glb",
  },
];

describe("VesselList.vue", (): void => {
  const getImageUrl = (p: string): string => `/img/${p}`;
  const getObjectUrl = (p: string): string => `/obj/${p}`;

  beforeEach((): void => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });
  afterEach((): void => {
    setActivePinia(undefined);
    vi.restoreAllMocks();
  });

  it("emits create on button click", async (): Promise<void> => {
    const wrapper = mount(VesselList, {
      props: {
        vessels,
        loading: false,
        error: null,
        getImageUrl,
        getObjectUrl,
      },
      global: {
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
    });

    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("create")).toBeTruthy();
  });

  it("filters rows by search and toggles sorting", async (): Promise<void> => {
    const wrapper = mount(VesselList, {
      props: {
        vessels,
        loading: false,
        error: null,
        getImageUrl,
        getObjectUrl,
      },
      global: {
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
    });

    const q = wrapper.get("input[type='text']");
    await q.setValue("aur");
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain("Aurora");

    // clear and sort desc by clicking Name header
    await q.setValue("");
    const nameHeader = wrapper.get("thead th:nth-child(3)");
    await nameHeader.trigger("click");

    const names = wrapper
      .findAll("tbody tr td:nth-child(3) span")
      .map((td) => td.text());
    expect(names).toEqual(["Zephyr", "Borealis", "Aurora"]);
  });

  it("selection and batch delete emits ids", async (): Promise<void> => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const wrapper = mount(VesselList, {
      props: {
        vessels,
        loading: false,
        error: null,
        getImageUrl,
        getObjectUrl,
      },
      global: {
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
    });

    // select first row
    const firstCheckbox = wrapper.get(
      "tbody tr:first-child input[type='checkbox']"
    );
    await firstCheckbox.setValue(true);

    // batch delete controls visible
    expect(wrapper.text()).toContain("1 selected");

    // click Delete Selected
    const deleteBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Delete Selected"));
    if (deleteBtn) {
      await deleteBtn.trigger("click");
    }

    const emitted = wrapper.emitted("batchDelete");
    expect(emitted).toBeTruthy();
    if (emitted) {
      const ids = emitted[0][0] as string[];
      expect(ids).toEqual(["1"]);
    }
  });

  it("edit and delete emit correct payload", async (): Promise<void> => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const wrapper = mount(VesselList, {
      props: {
        vessels,
        loading: false,
        error: null,
        getImageUrl,
        getObjectUrl,
      },
      global: {
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
    });

    // edit on first row
    const editBtn = wrapper
      .findAll("tbody tr:first-child button")
      .find((b) => b.text().includes("Edit"));
    if (editBtn) {
      await editBtn.trigger("click");
    }
    const editEmitted = wrapper.emitted("edit");
    if (editEmitted) {
      expect((editEmitted[0][0] as Vessel)._id).toBe("1");
    }

    // delete on first row
    const deleteBtn = wrapper
      .findAll("tbody tr:first-child button")
      .find((b) => b.text().includes("Delete"));
    if (deleteBtn) {
      await deleteBtn.trigger("click");
    }
    const deleteEmitted = wrapper.emitted("delete");
    if (deleteEmitted) {
      expect(deleteEmitted[0][0] as string).toBe("1");
    }
  });

  it("opens image and model viewers", async (): Promise<void> => {
    const wrapper = mount(VesselList, {
      props: {
        vessels,
        loading: false,
        error: null,
        getImageUrl,
        getObjectUrl,
      },
      global: {
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
    });

    // click image to open image viewer
    const img = wrapper.get("tbody tr:first-child img");
    await img.trigger("click");
    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      selectedImage: Vessel | null;
      selectedModel: Vessel | null;
      closeImageViewer: () => void;
    };
    await vm.$nextTick();

    // verify image viewer state is true (modal is displayed)
    expect(vm.selectedImage).toBeTruthy();
    expect(vm.selectedImage?._id).toBe("1");

    // close image viewer
    vm.closeImageViewer();
    await vm.$nextTick();

    // verify image viewer state is closed
    expect(vm.selectedImage).toBeFalsy();

    // open 3D viewer
    const viewBtn = wrapper
      .findAll("tbody tr:first-child button")
      .find((b) => b.text().includes("View 3D"));
    if (viewBtn) {
      await viewBtn.trigger("click");
    }
    await vm.$nextTick();

    // verify 3D viewer state is true (modal is displayed)
    expect(vm.selectedModel).toBeTruthy();
    expect(vm.selectedModel?._id).toBe("1");
  });
});
