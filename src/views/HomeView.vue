<template>
  <div class="relative h-screen w-full overflow-hidden">
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
            class="h-[30px] w-auto object-contain sm:h-10"
          />
        </a>
        <a :href="company2.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="company2.logo"
            :alt="`${company2.name} Logo`"
            class="h-[30px] w-auto object-contain sm:h-10"
          />
        </a>
        <a :href="company3.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="company3.logo"
            :alt="`${company3.name} Logo`"
            class="h-[30px] w-auto object-contain sm:h-10"
          />
        </a>
      </div>

      <!-- Bottom left text -->
      <div class="mb-8 ml-0 sm:mb-16 sm:ml-16">
        <p class="service-area-label text-base mb-3 sm:text-sm font-bold">
          SERVICE AREA | ONE
        </p>
        <h1
          class="m-0 text-3xl font-bold leading-tight tracking-wide text-white sm:text-5xl"
        >
          OFFSHORE SERVICE
          <br />
          & OPERATIONS
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

<style lang="scss" scoped></style>
