<template>
  <div class="navigation-wrapper fixed left-0 top-0 z-50 h-screen">
    <!-- Sliding container - holds both sidebar and toggle button -->
    <div
      ref="navContainerRef"
      class="nav-container fixed top-0 h-screen"
      :class="{ 'container-visible': isVisible }"
      @mouseenter="!isTouchMode ? handleContainerEnter : undefined"
      @mouseleave="!isTouchMode ? handleContainerLeave : undefined"
    >
      <!-- Sidebar -->
      <aside
        id="navigation-sidebar"
        class="absolute left-0 top-0 w-70 h-screen bg-white flex flex-col py-8 px-6 border-r border-gray-200"
      >
        <!-- Back to front page -->
        <div class="mb-8">
          <RouterLink
            v-if="!isHomePage"
            to="/"
            @click="handleNavLinkClick"
            class="inline-flex items-center gap-2 text-black text-sm no-underline nav-link-transition hover:text-gray-700"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            Back to front page
          </RouterLink>
          <span v-else class="block h-5">&nbsp;</span>
        </div>

        <!-- Service area heading -->
        <div class="mb-8">
          <p class="service-area-label text-xs mb-2">FLEET CATALOG</p>
          <h2
            class="text-gray-900 text-xl font-normal leading-tight tracking-wide m-0"
          >
            MARITIME ASSETS
            <br />
            & SOLUTIONS
          </h2>
        </div>

        <!-- Scrollable navigation area -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <!-- Navigation links - Dynamic vessel categories -->
          <nav class="flex flex-col" aria-label="Main navigation">
            <!-- Loading state -->
            <div v-if="loading" class="py-3 text-sm text-gray-500">
              Loading vessels...
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="py-3 text-sm text-red-600">
              Failed to load vessels
            </div>

            <!-- Empty state -->
            <div
              v-else-if="categories.length === 0"
              class="py-3 text-sm text-gray-500"
            >
              No vessels available
            </div>

            <!-- Category sections -->
            <template v-else>
              <div
                v-for="category in categories"
                :key="category.name"
                class="category-section"
              >
                <!-- Category button with chevron -->
                <button
                  @click="toggleCategory(category.name)"
                  type="button"
                  class="flex items-center justify-start gap-2 w-full py-3 px-0! text-black text-sm font-normal text-left cursor-pointer border-none bg-transparent hover:text-gray-700 transition-colors"
                >
                  <span
                    class="flex items-center justify-center w-4 h-4 shrink-0"
                  >
                    <ChevronUpIcon
                      class="w-3.5 h-3.5 transition-transform duration-300 ease-out"
                      :class="{
                        'rotate-90': !category.isOpen.value,
                        'rotate-180': category.isOpen.value,
                      }"
                    />
                  </span>
                  {{ category.name }}
                </button>

                <!-- Animated folddown with vessel links -->
                <Transition name="category-slide">
                  <div v-show="category.isOpen.value" class="overflow-hidden">
                    <!-- Separator between category and vessels -->
                    <div class="h-px bg-gray-300 my-2 mx-6"></div>

                    <div class="ml-6">
                      <RouterLink
                        v-for="vessel in category.vessels"
                        :key="vessel._id"
                        :to="`/vessel/${vessel._id}`"
                        @click="handleNavLinkClick"
                        class="block text-black text-sm no-underline py-2 nav-link-transition hover:text-gray-700"
                      >
                        {{ vessel.name }}
                      </RouterLink>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>
          </nav>
        </div>

        <!-- Spacer -->
        <div class="mb-6"></div>

        <!-- Logos section -->
        <div class="bg-[#172554] -mx-6 -mb-8">
          <!-- About Us foldout -->
          <div class="px-6 pt-4">
            <button
              @click="toggleAbout"
              type="button"
              class="flex items-center justify-start gap-2 w-full p-0! text-white/80 text-sm font-medium cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity"
            >
              ABOUT US
              <span
                class="flex items-center justify-center w-5 h-5 bg-[#f2823b] rounded-full"
              >
                <ChevronUpIcon
                  class="w-3 h-3 transition-transform duration-300 ease-out text-white stroke-2"
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

          <!-- Logo -->
          <div class="flex justify-center items-center gap-4 px-6 pb-6">
            <a
              :href="company.url"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleNavLinkClick"
            >
              <img
                :src="company.logo"
                :alt="`${company.name} Logo`"
                class="h-7.5 w-auto object-contain"
              />
            </a>
          </div>
        </div>
      </aside>

      <!-- Toggle button -->
      <button
        ref="toggleButtonRef"
        @click="toggleLock"
        class="-ml-px nav-toggle-btn absolute top-4 left-70 w-8 h-8 bg-white border border-gray-200 border-l-0 rounded-tr-md rounded-br-md flex items-center justify-center cursor-pointer hover:bg-gray-50 focus:outline-none"
        :class="{
          'toggle-locked': !isTouchMode && isLocked,
          'glow-active': showGlowAnimation,
          'has-entered': hasEntered,
        }"
        :aria-expanded="isVisible"
        aria-controls="navigation-sidebar"
        :aria-label="
          isTouchMode
            ? isVisible
              ? 'Close navigation menu'
              : 'Open navigation menu'
            : 'Toggle navigation menu lock'
        "
      >
        <Transition name="icon-fade" mode="out-in">
          <!-- Touch mode: burger → X -->
          <template v-if="isTouchMode">
            <Bars3Icon
              v-if="!isVisible"
              key="bars-touch"
              class="absolute w-4 h-4 text-gray-700"
            />
            <XMarkIcon
              v-else
              key="x-mark"
              class="absolute w-4 h-4 text-gray-700"
            />
          </template>

          <!-- Mouse mode: burger → open lock → closed lock -->
          <template v-else>
            <!-- Burger menu when nav is hidden -->
            <Bars3Icon
              v-if="!isVisible"
              key="bars-mouse"
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
          </template>
        </Transition>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeftIcon,
  Bars3Icon,
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

// Project imports
import { useVesselCategories } from "@/modules/vessels/useVesselCategories";
import { useNavigationState } from "@/modules/navigation/useNavigationState";

const route = useRoute();
const { categories, loading, error, fetchCategories } = useVesselCategories();

// Navigation state composable
const {
  isLocked,
  isVisible,
  showGlowAnimation,
  hasEntered,
  isTouchMode,
  toggleLock,
  handleContainerEnter,
  handleContainerLeave,
  setupMouseTracking,
  cleanupMouseTracking,
  triggerEntranceAnimation,
  startGlowTimeout,
  closeNavigation: _closeNavigation,
  handleNavLinkClick,
  setupClickListeners,
} = useNavigationState();

// Template refs for click-outside detection
const navContainerRef = ref<HTMLElement | null>(null);
const toggleButtonRef = ref<HTMLElement | null>(null);

// Local state
const isAboutOpen = ref(false);

const toggleAbout = (): void => {
  isAboutOpen.value = !isAboutOpen.value;
};

// Toggle category open/closed state
const toggleCategory = (categoryName: string): void => {
  const category = categories.value.find((c) => c.name === categoryName);
  if (category) {
    category.isOpen.value = !category.isOpen.value;
  }
};

onMounted(() => {
  setupMouseTracking();
  void fetchCategories();
  triggerEntranceAnimation();
  startGlowTimeout();
  setupClickListeners(navContainerRef, toggleButtonRef)();
});

onUnmounted(() => {
  cleanupMouseTracking();
});

const isHomePage = computed<boolean>(() => route.path === "/");

// About us text from environment
const aboutUsText = import.meta.env.VITE_ABOUT_US as string;

const resolveUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.startsWith("/") ? path.slice(1) : path}`;

// Company info from environment
const company = {
  name: import.meta.env.VITE_COMPANY1_NAME as string,
  url: import.meta.env.VITE_COMPANY1_URL as string,
  logo: resolveUrl(import.meta.env.VITE_COMPANY1_LOGO as string),
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

// Category slide transition
.category-slide-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out,
    max-height 0.3s ease-out;
  max-height: 500px;
}

.category-slide-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in,
    max-height 0.2s ease-in;
  max-height: 500px;
}

.category-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.category-slide-leave-to {
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

  .category-slide-enter-active,
  .category-slide-leave-active {
    transition: none;
  }
}
</style>
