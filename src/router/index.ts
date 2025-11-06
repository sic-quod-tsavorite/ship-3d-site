import { createRouter, createWebHistory } from "vue-router";
import type { Component } from "vue";
import HomeView from "../views/HomeView.vue";
import AdminView from "../views/admin/AdminView.vue";
import LoginView from "../views/admin/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView as Component,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView as Component,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView as Component,
    },
  ],
});

export default router;
