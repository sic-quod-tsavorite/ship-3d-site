<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <RouterLink to="/" class="font-bold text-xl">MySite</RouterLink>
      <div class="space-x-4">
        <RouterLink to="/" class="mr-4">Home</RouterLink>
        <RouterLink v-if="!isLoggedIn" to="/login" class="mr-4">
          Login
        </RouterLink>
        <RouterLink v-if="isLoggedIn" to="/admin" class="mr-4">
          Admin
        </RouterLink>
        <a href="#" class="hover:text-gray-300">About</a>
        <a href="#" class="hover:text-gray-300">Contact</a>
        <button v-if="isLoggedIn" @click="logout" class="hover:text-gray-300">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUsers } from "../modules/auth/useUsers";

const { isLoggedIn, logout } = useUsers();
</script>

<style lang="scss" scoped>
.router-link-active {
  color: #6afc63;
}
</style>
