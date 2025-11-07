import { test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HomeView from "../views/HomeView.vue";

const wrapper = mount(HomeView);

test("HomeView renders a <p>", () => {
  expect(wrapper.find("p").exists()).toBe(true);
});

test("HomeView renders a <h2>", () => {
  expect(wrapper.find("h2").exists()).toBe(false);
});
