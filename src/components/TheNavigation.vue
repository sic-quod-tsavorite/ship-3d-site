<template>
  <div class="navigation-wrapper fixed left-0 top-0 z-50 h-screen">
    <!-- Sliding container - holds both sidebar and toggle button -->
    <div
      class="nav-container fixed top-0 h-screen"
      :class="{ 'container-visible': isVisible }"
      @mouseenter="handleContainerEnter"
      @mouseleave="handleContainerLeave"
    >
      <!-- Sidebar -->
      <aside
        id="navigation-sidebar"
        class="absolute left-0 top-0 w-[280px] h-screen bg-white flex flex-col py-8 px-6 border-r border-gray-200"
      >
        <!-- Back to front page -->
        <div class="mb-8">
          <RouterLink
            v-if="!isHomePage"
            to="/"
            class="inline-flex items-center gap-2 text-black text-sm no-underline nav-link-transition hover:text-gray-700"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            Back to front page
          </RouterLink>
          <span v-else class="block h-5">&nbsp;</span>
        </div>

        <!-- Service area heading -->
        <div class="mb-8">
          <p class="service-area-label text-xs mb-2">SERVICE AREA | ONE</p>
          <h2
            class="text-gray-900 text-xl font-normal leading-tight tracking-wide m-0"
          >
            OFFSHORE SERVICE
            <br />
            & OPERATIONS
          </h2>
        </div>

        <!-- Navigation links -->
        <nav class="flex flex-col" aria-label="Main navigation">
          <RouterLink
            to="/survey"
            class="text-black text-sm no-underline py-3 nav-link-transition hover:text-gray-700"
          >
            Survey and Inspection
          </RouterLink>
          <div class="h-px bg-gray-200"></div>
          <RouterLink
            to="/maintenance"
            class="text-black text-sm no-underline py-3 nav-link-transition hover:text-gray-700"
          >
            Maintenance
          </RouterLink>
          <div class="h-px bg-gray-200"></div>
          <RouterLink
            to="/supply"
            class="text-black text-sm no-underline py-3 nav-link-transition hover:text-gray-700"
          >
            Supply services
          </RouterLink>
          <div class="h-px bg-gray-200"></div>
          <RouterLink
            to="/guard"
            class="text-black text-sm no-underline py-3 nav-link-transition hover:text-gray-700"
          >
            Guard and chase duties
          </RouterLink>
        </nav>

        <!-- Spacer to push buttons and logos to bottom -->
        <div class="flex-1"></div>

        <p class="text-center text-xs text-gray-500 italic mb-6">
          *Kun menupunkter markeret med rød pil er interaktive i nuværrende
          version af siden.
        </p>

        <!-- Auth buttons -->
        <div class="flex flex-col gap-2 mb-6">
          <RouterLink
            v-if="!auth.isLoggedIn"
            to="/login"
            class="block text-center py-2.5 px-4 text-sm font-medium no-underline cursor-pointer bg-white text-black border-4 border-[#BCD5E5] hover:bg-[#BCD5E5] transition-colors"
          >
            Login
          </RouterLink>
          <template v-else>
            <RouterLink
              to="/admin"
              class="block text-center py-2.5 px-4 text-sm font-medium no-underline cursor-pointer bg-white text-black border-4 border-[#BCD5E5] hover:bg-[#BCD5E5] transition-colors"
            >
              Admin
            </RouterLink>
            <button
              @click="handleLogout"
              type="button"
              class="block text-center py-2.5 px-4 text-sm font-medium no-underline border-none cursor-pointer bg-red-600 text-white! hover:opacity-90 transition-opacity"
            >
              Logout
            </button>
          </template>
        </div>

        <!-- Logos section -->
        <div class="bg-[#0D2638] -mx-6 -mb-8">
          <!-- About Us foldout -->
          <div class="px-6 pt-4">
            <button
              @click="toggleAbout"
              type="button"
              class="flex items-center justify-start gap-2 w-full p-0! text-white/80 text-sm font-medium cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity"
            >
              ABOUT US
              <span
                class="flex items-center justify-center w-5 h-5 bg-red-600 rounded-full"
              >
                <ChevronUpIcon
                  class="w-3 h-3 transition-transform duration-300 ease-out"
                  :class="{ 'rotate-180': isAboutOpen }"
                />
              </span>
            </button>
            <Transition name="about-slide">
              <div
                v-show="isAboutOpen"
                class="mt-3 text-white/70 text-xs leading-relaxed overflow-hidden"
              >
                <p>{{ aboutUsText }}</p>
              </div>
            </Transition>
          </div>

          <!-- Separator -->
          <div class="h-px bg-white/20 mx-6 my-4"></div>

          <!-- Logos -->
          <div class="flex justify-around items-center gap-4 px-6 pb-6">
            <a :href="company1.url" target="_blank" rel="noopener noreferrer">
              <img
                :src="company1.logo"
                :alt="`${company1.name} Logo`"
                class="h-[30px] w-auto object-contain"
              />
            </a>
            <a :href="company2.url" target="_blank" rel="noopener noreferrer">
              <img
                :src="company2.logo"
                :alt="`${company2.name} Logo`"
                class="h-[30px] w-auto object-contain"
              />
            </a>
            <a :href="company3.url" target="_blank" rel="noopener noreferrer">
              <img
                :src="company3.logo"
                :alt="`${company3.name} Logo`"
                class="h-[30px] w-auto object-contain"
              />
            </a>
          </div>
        </div>
      </aside>

      <!-- Toggle button -->
      <button
        @click="toggleLock"
        class="-ml-px nav-toggle-btn absolute top-4 left-[280px] w-8 h-8 bg-white border border-gray-200 border-l-0 rounded-tr-md rounded-br-md flex items-center justify-center cursor-pointer hover:bg-gray-50 focus:outline-none"
        :class="{
          'toggle-locked': isLocked,
          'glow-active': showGlowAnimation,
          'has-entered': hasEntered,
        }"
        :aria-expanded="isVisible"
        aria-controls="navigation-sidebar"
        aria-label="Toggle navigation menu"
      >
        <Transition name="icon-fade" mode="out-in">
          <!-- Burger menu when nav is hidden -->
          <Bars3Icon
            v-if="!isVisible"
            key="bars"
            class="absolute w-4 h-4 text-gray-700"
          />
          <!-- Open lock when visible but not locked (state: unlocked) -->
          <LockOpenIcon
            v-else-if="!isLocked"
            key="lock-open"
            class="absolute w-4 h-4 text-gray-700"
          />
          <!-- Closed lock when locked (state: locked) -->
          <LockClosedIcon
            v-else
            key="lock-closed"
            class="absolute w-4 h-4 text-gray-700"
          />
        </Transition>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  ArrowLeftIcon,
  Bars3Icon,
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const route = useRoute();

// State
const isLocked = ref(false);
const isHovering = ref(false);
const showGlowAnimation = ref(true);
const hasEntered = ref(false);
const isAboutOpen = ref(false);

const toggleAbout = (): void => {
  isAboutOpen.value = !isAboutOpen.value;
};

// Navigation is visible when locked OR when hovering
const isVisible = computed<boolean>(() => isLocked.value || isHovering.value);

// Stop glow animation
const stopGlowAnimation = (): void => {
  showGlowAnimation.value = false;
};

// Stop animation when navigation becomes visible
watch(isVisible, (visible) => {
  if (visible && showGlowAnimation.value) {
    stopGlowAnimation();
  }
});

// Track mouse position for hover zone detection
const HOVER_ZONE_WIDTH = 350;

const handleMouseMove = (e: MouseEvent): void => {
  if (isLocked.value) return;

  const isInHoverZone = e.clientX <= HOVER_ZONE_WIDTH;
  if (isInHoverZone && !isHovering.value) {
    isHovering.value = true;
  } else if (!isInHoverZone && isHovering.value) {
    isHovering.value = false;
  }
};

let glowTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  document.addEventListener("mousemove", handleMouseMove);

  // Trigger entrance animation after initial render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hasEntered.value = true;
    });
  });

  // Stop glow animation after 10 seconds
  glowTimeout = setTimeout(() => {
    stopGlowAnimation();
  }, 10000);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  if (glowTimeout) {
    clearTimeout(glowTimeout);
  }
});

const isHomePage = computed<boolean>(() => route.path === "/");

// Toggle lock state
const toggleLock = (): void => {
  isLocked.value = !isLocked.value;
};

// Container hover handlers (to keep nav open while interacting with it)
const handleContainerEnter = (): void => {
  if (!isLocked.value) {
    isHovering.value = true;
  }
};

const handleContainerLeave = (): void => {
  if (!isLocked.value) {
    isHovering.value = false;
  }
};

const handleLogout = (): void => {
  void auth.logout();
};

// About us text from environment
const aboutUsText = import.meta.env.VITE_ABOUT_US as string;

// Company info from environment
const company1 = {
  name: import.meta.env.VITE_COMPANY1_NAME as string,
  url: import.meta.env.VITE_COMPANY1_URL as string,
  logo: import.meta.env.VITE_COMPANY1_LOGO as string,
};
const company2 = {
  name: import.meta.env.VITE_COMPANY2_NAME as string,
  url: import.meta.env.VITE_COMPANY2_URL as string,
  logo: import.meta.env.VITE_COMPANY2_LOGO as string,
};
const company3 = {
  name: import.meta.env.VITE_COMPANY3_NAME as string,
  url: import.meta.env.VITE_COMPANY3_URL as string,
  logo: import.meta.env.VITE_COMPANY3_LOGO as string,
};
</script>

<style lang="scss" scoped>
$nav-sidebar-width: 280px;
$nav-transition-duration: 0.3s;

// Pulsing glow animation for toggle button
@keyframes gentle-glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 150px 8px rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 300px 200px rgba(99, 102, 241, 0.6);
  }
}

.nav-container {
  left: 0;
  transform: translateX(-$nav-sidebar-width);
  transition: transform $nav-transition-duration ease;

  &.container-visible {
    transform: translateX(0);
  }
}

.nav-toggle-btn {
  // Entrance animation: start off-screen, slide in
  opacity: 0;
  transform: translateX(-50px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;

  &.has-entered {
    opacity: 1;
    transform: translateX(0);
  }

  // Glow animation only when .glow-active is present
  &.glow-active {
    animation: gentle-glow-pulse 5s ease-in-out infinite;
  }

  &.toggle-locked {
    animation: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    background-color: #f3f4f6;
  }
}

// Icon transition animation
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

// About Us slide transition
.about-slide-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out,
    max-height 0.3s ease-out;
  max-height: 200px;
}

.about-slide-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in,
    max-height 0.2s ease-in;
  max-height: 200px;
}

.about-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.about-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

// Accessibility: respect reduced motion preferences
@media (prefers-reduced-motion: reduce) {
  .nav-toggle-btn {
    // No entrance animation - show immediately
    opacity: 1;
    transform: translateX(0);
    transition: none;

    &.glow-active {
      animation: none;
      box-shadow: 0 0 150px 8px rgba(99, 102, 241, 0.4);
    }
  }

  .icon-fade-enter-active,
  .icon-fade-leave-active {
    transition: none;
  }
}
</style>
