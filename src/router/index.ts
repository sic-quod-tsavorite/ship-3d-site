// Imports
import { createRouter, createWebHistory } from "vue-router";
import type { Component } from "vue";

// Project imports
import HomeView from "@/views/HomeView.vue";
import AdminView from "@/views/admin/AdminView.vue";
import LoginView from "@/views/admin/LoginView.vue";
import VesselDetailView from "@/views/VesselDetailView.vue";
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
      path: `${routePrefix}/vessel/:id`,
      name: "vessel-detail",
      component: VesselDetailView as Component,
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound as Component,
    },
  ],
});

router.beforeEach(async (to, _from, next): Promise<void> => {
  const auth = useAuthStore();

  // Initialize auth on first navigation (checks server session cookie)
  if (!auth.authInitialized) {
    await auth.initAuth();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !auth.isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router;
