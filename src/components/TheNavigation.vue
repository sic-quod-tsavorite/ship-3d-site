<template>
  <header
    class="sticky top-0 z-40 w-full backdrop-blur supports-backdrop-filter:bg-slate-300/80 bg-slate-300/90 border-b border-slate-200 shadow-sm"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6"
      aria-label="Main navigation"
    >
      <!-- Brand -->
      <RouterLink
        to="/"
        class="relative inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-indigo-500 to-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span class="select-none">3D Dev</span>
      </RouterLink>

      <!-- Mobile toggle -->
      <button
        type="button"
        class="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-300 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
        style="padding-inline: 0"
        :aria-expanded="menuOpen"
        aria-controls="primary-menu"
        @click="toggleMenu"
      >
        <span class="sr-only">Toggle navigation</span>
        <Bars3Icon v-if="!menuOpen" class="h-5 w-5 mx-auto" />
        <XMarkIcon v-else class="h-5 w-5 mx-auto" />
      </button>

      <!-- Desktop menu -->
      <div class="hidden lg:flex items-center gap-6" id="primary-menu">
        <RouterLink :class="linkClass('/')" to="/">Home</RouterLink>
        <RouterLink :class="linkClass('/map')" to="/map">Map</RouterLink>
        <RouterLink
          v-if="!auth.isLoggedIn"
          :class="linkClass('/login')"
          to="/login"
        >
          Login
        </RouterLink>
        <RouterLink
          v-if="auth.isLoggedIn"
          :class="linkClass('/admin')"
          to="/admin"
        >
          Admin
        </RouterLink>
        <button
          v-if="auth.isLoggedIn"
          @click="void auth.logout()"
          type="button"
          class="group relative inline-flex items-center overflow-hidden rounded-xl bg-linear-to-r from-red-500 via-red-400 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-red-500/30 transition hover:from-red-400 hover:via-pink-400 hover:to-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <span
            class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
          ></span>
          <span class="relative">Logout</span>
        </button>
      </div>
    </nav>

    <!-- Mobile flyout -->
    <transition
      name="fade"
      enter-active-class="duration-150 ease-out"
      leave-active-class="duration-100 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="menuOpen"
        class="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur px-4 pb-4 shadow-sm"
      >
        <div class="flex flex-col gap-2">
          <RouterLink :class="mobileLinkClass('/')" to="/" @click="closeMenu">
            >Home
          </RouterLink>
          <RouterLink
            :class="mobileLinkClass('/map')"
            to="/map"
            @click="closeMenu"
          >
            Map
          </RouterLink>
          <RouterLink
            v-if="!auth.isLoggedIn"
            :class="mobileLinkClass('/login')"
            to="/login"
            @click="closeMenu"
          >
            Login
          </RouterLink>
          <RouterLink
            v-if="auth.isLoggedIn"
            :class="mobileLinkClass('/admin')"
            to="/admin"
            @click="closeMenu"
          >
            Admin
          </RouterLink>
          <button
            v-if="auth.isLoggedIn"
            @click="handleLogout"
            type="button"
            class="group relative mt-2 w-full overflow-hidden rounded-xl bg-linear-to-r from-red-500 via-red-400 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition hover:from-red-400 hover:via-pink-400 hover:to-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
            ></span>
            <span class="relative">Logout</span>
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const route = useRoute();
const menuOpen = ref(false);

const toggleMenu = (): void => {
  menuOpen.value = !menuOpen.value;
};
const closeMenu = (): void => {
  menuOpen.value = false;
};
const handleLogout = (): void => {
  void auth.logout();
  closeMenu();
};

const linkBase =
  "relative inline-flex items-center text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const linkInactive = "text-slate-600 hover:text-slate-900";
const linkActive =
  "text-slate-900 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-linear-to-r after:from-indigo-500 after:to-sky-500";

const linkClass = (path: string): string => {
  return `${linkBase} ${route.path === path ? linkActive : linkInactive}`;
};
const mobileLinkClass = (path: string): string => {
  return `block rounded-lg px-3 py-2 text-sm font-medium ${route.path === path ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`;
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
