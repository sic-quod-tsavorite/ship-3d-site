// Imports
import { test, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";

// Project imports
import AdminView from "@/views/admin/AdminView.vue";

// Mock vue-router's useRouter hook, but keep other exports
const mockRouterPush = vi.fn();
vi.mock(
  "vue-router",
  async (importOriginal): Promise<Record<string, unknown>> => {
    const actual: object = await importOriginal();
    return {
      ...actual,
      useRouter: () => ({
        push: mockRouterPush,
      }),
    } as Record<string, unknown>;
  }
);

let wrapper: VueWrapper<InstanceType<typeof AdminView>>;

beforeEach((): void => {
  vi.clearAllMocks();
  wrapper = mount(AdminView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { isLoggedIn: false },
          },
          stubActions: false,
        }),
      ],
    },
  });
});

test("AdminView renders Loading", (): void => {
  expect(wrapper.find("div").text()).toContain("Loading...");
});

test("AdminView should not render a <p> since not logged in", (): void => {
  expect(wrapper.find("p").exists()).toBe(false);
});

test("Expect malicious logged in status to fail", (): void => {
  // Simulate being logged in by setting Pinia store initial state
  wrapper = mount(AdminView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { isLoggedIn: true },
          },
          stubActions: false,
        }),
      ],
    },
  });
  expect(wrapper.find("p").exists()).toBe(false);
  expect(wrapper.find("div").text()).toContain("Loading...");
});
