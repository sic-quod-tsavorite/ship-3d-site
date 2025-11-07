import { test, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import AdminView from "../views/admin/AdminView.vue";

// Mock vue-router's useRouter hook
const mockRouterPush = vi.fn();
vi.mock("vue-router", (): { useRouter: () => { push: Mock } } => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

let wrapper: VueWrapper<InstanceType<typeof AdminView>>;

beforeEach(() => {
  // Clear all mocks on localStorage before each test
  vi.clearAllMocks();
  // Ensure isLoggedIn is false by default.
  vi.spyOn(localStorage, "getItem").mockImplementation((key: string) => {
    if (key === "isLoggedIn") return "false";
    return null;
  });
  wrapper = mount(AdminView);
});

test("AdminView renders Loading", () => {
  expect(wrapper.find("div").text()).toContain("Loading...");
});

test("AdminView should not render a <p> since not logged in", () => {
  expect(wrapper.find("p").exists()).toBe(false);
});

test("Expect malicious logged in status to fail", () => {
  // Override the mock for this specific test to simulate being logged in
  vi.spyOn(localStorage, "getItem").mockReturnValueOnce("true");
  // Remount the component after changing the mock
  wrapper = mount(AdminView);
  expect(wrapper.find("p").exists()).toBe(false);
  expect(wrapper.find("div").text()).toContain("Loading...");
});
