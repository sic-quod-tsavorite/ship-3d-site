import { createRouter, createWebHistory } from "vue-router";
import type { Component } from "vue";
import HomeView from "@/views/HomeView.vue";
import MapView from "@/views/MapView.vue";
import AdminView from "@/views/admin/AdminView.vue";
import LoginView from "@/views/admin/LoginView.vue";
import NotFound from "@/views/NotFound.vue";
import { useAuthStore } from "@/stores/auth";

const routePrefix = (import.meta.env.VITE_ROUTER_PREFIX as string) || "";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: `${routePrefix}/`,
      name: "home",
      component: HomeView as Component,
    },
    {
      path: `${routePrefix}/map`,
      name: "map",
      component: MapView as Component,
    },
    {
      path: `${routePrefix}/login`,
      name: "login",
      component: LoginView as Component,
    },
    {
      path: `${routePrefix}/admin`,
      name: "admin",
      component: AdminView as Component,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound as Component,
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !auth.isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router;
