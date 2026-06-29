<template>
  <div class="relative h-screen w-full overflow-hidden">
    <!-- Background image -->
    <div class="absolute inset-0 z-0">
      <div class="bg-[#172554]/70 h-screen w-screen absolute"></div>
      <img
        :src="backgroundImage"
        alt="Offshore vessel with turbine"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- Content layer -->
    <div
      class="relative z-10 flex h-full w-full flex-col justify-between p-6 sm:px-12 sm:py-8"
    >
      <!-- Top right logos -->
      <div class="flex items-center justify-end gap-4 sm:gap-6">
        <a :href="company1.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="company1.logo"
            :alt="`${company1.name} Logo`"
            class="h-7.5 w-auto object-contain sm:h-10"
          />
        </a>
        <a :href="company2.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="company2.logo"
            :alt="`${company2.name} Logo`"
            class="h-7.5 w-auto object-contain sm:h-10"
          />
        </a>
        <a :href="company3.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="company3.logo"
            :alt="`${company3.name} Logo`"
            class="h-7.5 w-auto object-contain sm:h-10"
          />
        </a>
      </div>

      <!-- Bottom left text -->
      <div class="mb-8 ml-0 sm:mb-16 sm:ml-16">
        <p class="service-area-label text-base mb-3 sm:text-sm font-bold">
          FLEET CATALOG
        </p>
        <h1
          class="m-0 text-3xl font-bold leading-tight tracking-wide text-white sm:text-5xl"
        >
          MARITIME ASSETS
          <br />
          & SOLUTIONS
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Asset paths
const backgroundImage = `${import.meta.env.BASE_URL}static-assets/images/wind-turbine.png`;

const resolveUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.startsWith("/") ? path.slice(1) : path}`;

// Company info from environment
const company1 = {
  name: import.meta.env.VITE_COMPANY1_NAME as string,
  url: import.meta.env.VITE_COMPANY1_URL as string,
  logo: resolveUrl(import.meta.env.VITE_COMPANY1_LOGO as string),
};
const company2 = {
  name: import.meta.env.VITE_COMPANY2_NAME as string,
  url: import.meta.env.VITE_COMPANY2_URL as string,
  logo: resolveUrl(import.meta.env.VITE_COMPANY2_LOGO as string),
};
const company3 = {
  name: import.meta.env.VITE_COMPANY3_NAME as string,
  url: import.meta.env.VITE_COMPANY3_URL as string,
  logo: resolveUrl(import.meta.env.VITE_COMPANY3_LOGO as string),
};
</script>

<style lang="scss" scoped></style>
