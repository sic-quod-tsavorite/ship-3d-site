<template>
  <div v-if="!auth.isLoggedIn" class="text-center">Loading...</div>
  <div v-else class="flex flex-wrap -mx-2">
    <p>admin view</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push("/login");
  }
});
</script>

<style lang="scss" scoped></style>
