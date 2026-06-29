// Imports
import { createRouter, createWebHistory } from "vue-router";
import type { Component } from "vue";

// Project imports
import HomeView from "@/views/HomeView.vue";
import VesselDetailView from "@/views/VesselDetailView.vue";
import NotFound from "@/views/NotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView as Component,
    },
    {
      path: "/vessel/:id",
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

export default router;
