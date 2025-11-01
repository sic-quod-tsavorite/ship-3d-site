import { test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AdminView from "../views/admin/AdminView.vue";

const wrapper = mount(AdminView);

test("AdminView renders a <p>", () => {
  expect(wrapper.find("p").exists()).toBe(true);
});

test("AdminView renders a <h1>", () => {
  expect(wrapper.find("h1").exists()).toBe(false);
});
