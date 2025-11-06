<template>
  <div v-if="!state.isLoggedIn" class="text-center">Loading...</div>
  <div v-else class="flex flex-wrap -mx-2">
    <p>admin view</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { state } from "../../modules/global/state";

const router = useRouter();

onMounted(async () => {
  if (!state.isLoggedIn) {
    router.push("/login");
  }
});
</script>

<style lang="scss" scoped></style>
