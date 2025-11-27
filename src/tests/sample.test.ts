// Imports
import { test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

// Project imports
import HomeView from "../views/HomeView.vue";

// Mock indexedDB
Object.defineProperty(global, "indexedDB", {
  value: {
    open: () => ({
      onsuccess: null,
      onerror: null,
    }),
  },
  writable: true,
});

test("HomeView renders", () => {
  setActivePinia(createPinia());

  const wrapper = mount(HomeView, {
    global: {
      stubs: {
        ThreeModelViewer: { template: "<div />" },
        ModelCacheDebug: { template: "<div />" },
      },
    },
  });

  expect(wrapper.find("h1").exists()).toBe(true);
  expect(wrapper.find("p").exists()).toBe(true);
});
