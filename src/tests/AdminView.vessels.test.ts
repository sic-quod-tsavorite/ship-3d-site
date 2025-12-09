/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Imports
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";

// Project imports
import AdminView from "@/views/admin/AdminView.vue";
import type { Vessel } from "@/interfaces/vesselInterfaces";

// Mock vue-router's useRouter
const mockRouterPush = vi.fn();
vi.mock(
  "vue-router",
  async (importOriginal): Promise<Record<string, unknown>> => {
    const actual: object = await importOriginal();
    return {
      ...actual,
      useRouter: () => ({ push: mockRouterPush }),
    } as Record<string, unknown>;
  }
);

// Mock auth store to report logged in
vi.mock("@/stores/auth", () => ({
  useAuthStore: (): { isLoggedIn: boolean } => ({ isLoggedIn: true }),
}));

// Mutable stubs for useVessels
const vesselsRef = ref<Vessel[]>([
  {
    _id: "1",
    name: "Aurora",
    description: "Alpha",
    image: "a.jpg",
    object: "a.glb",
    category: "Survey",
  },
]);
const loadingRef = ref(false);
const errorRef = ref<string | null>(null);
const fetchVessels = vi.fn((): Promise<void> => Promise.resolve());
const createVessel = vi.fn((): Promise<boolean> => Promise.resolve(true));
const updateVessel = vi.fn((): Promise<boolean> => Promise.resolve(true));
const deleteVessel = vi.fn((): Promise<boolean> => Promise.resolve(true));
const validateImageFile = vi.fn((_f: File | null): string | null => null);
const validateObjectFile = vi.fn((_f: File | null): string | null => null);
const getImageUrl = (_p: string): string => "/img";
const getObjectUrl = (_p: string): string => "/obj";

vi.mock("@/modules/vessels/useVessels", () => ({
  useVessels: (): ReturnType<
    typeof import("@/modules/vessels/useVessels").useVessels
  > => ({
    vessels: vesselsRef,
    loading: loadingRef,
    error: errorRef,
    fetchVessels,
    createVessel,
    updateVessel,
    deleteVessel,
    validateImageFile,
    validateObjectFile,
    getImageUrl,
    getObjectUrl,
  }),
}));

describe("AdminView vessels integration", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  const mountLoggedIn = (): ReturnType<typeof mount<typeof AdminView>> =>
    mount(AdminView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          ThreeModelViewer: { template: '<div class="three-stub" />' },
        },
      },
      attachTo: document.body,
    });

  it("opens create form and submits then closes on success", async () => {
    const wrapper = mountLoggedIn();
    await nextTick();

    wrapper.findComponent({ name: "VesselList" }).vm.$emit("create");
    await nextTick();

    expect(wrapper.findComponent({ name: "VesselForm" }).exists()).toBe(true);

    wrapper.findComponent({ name: "VesselForm" }).vm.$emit("submit", {
      name: "N",
      description: "D",
      imageFile: new File(["x"], "i.png", { type: "image/png" }),
      objectFile: new File(["x"], "m.glb"),
    });
    await nextTick();

    expect(createVessel).toHaveBeenCalled();
    await nextTick();
    expect(wrapper.findComponent({ name: "VesselForm" }).exists()).toBe(false);
  });

  it("opens edit form and closes on success", async () => {
    const wrapper = mountLoggedIn();
    await nextTick();

    const vessel = vesselsRef.value[0];
    wrapper.findComponent({ name: "VesselList" }).vm.$emit("edit", vessel);
    await nextTick();

    expect(wrapper.findComponent({ name: "VesselForm" }).exists()).toBe(true);

    wrapper.findComponent({ name: "VesselForm" }).vm.$emit("submit", {
      name: "New",
      description: "D",
      imageFile: null,
      objectFile: null,
    });
    await nextTick();

    expect(updateVessel).toHaveBeenCalledWith({
      _id: vessel._id,
      name: "New",
      description: "D",
      imageFile: null,
      objectFile: null,
    });
    await nextTick();
    expect(wrapper.findComponent({ name: "VesselForm" }).exists()).toBe(false);
  });

  it("keeps form open on update failure", async () => {
    (updateVessel as Mock).mockResolvedValueOnce(false);
    const wrapper = mountLoggedIn();
    await nextTick();

    const vessel = vesselsRef.value[0];
    wrapper.findComponent({ name: "VesselList" }).vm.$emit("edit", vessel);
    await nextTick();

    wrapper.findComponent({ name: "VesselForm" }).vm.$emit("submit", {
      name: "N",
      description: "D",
      imageFile: null,
      objectFile: null,
    });
    await nextTick();

    expect(updateVessel).toHaveBeenCalled();
    expect(wrapper.findComponent({ name: "VesselForm" }).exists()).toBe(true);
  });

  it("handles delete and batch delete", async () => {
    const wrapper = mountLoggedIn();
    await nextTick();

    const list = wrapper.findComponent({ name: "VesselList" });
    list.vm.$emit("delete", "123");
    await nextTick();
    expect(deleteVessel).toHaveBeenCalledWith("123");

    list.vm.$emit("batchDelete", ["1", "2"]);
    await nextTick();
    expect(deleteVessel).toHaveBeenCalledWith("1");
    expect(deleteVessel).toHaveBeenCalledWith("2");
  });
});
