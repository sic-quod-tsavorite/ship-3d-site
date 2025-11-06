<template>
  <div class="flex h-150">
    <!-- Left side with background image -->
    <div
      class="w-1/2 bg-cover bg-center"
      style="
        background-image: url(&quot;https://picsum.photos/800/1200?random=1&quot;);
        background-color: #1a202c; /* A dark blue-gray fallback */
      "
    ></div>

    <!-- Right side with login and register forms -->
    <div class="w-1/2 bg-white grow text-gray-800 flex flex-col p-8">
      <!-- Top part: Login -->
      <div class="mb-12">
        <p class="text-3xl font-semibold mb-6 text-center">Welcome!</p>
        <input
          type="text"
          class="w-full mb-4 p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Email"
          v-model="email"
        />
        <input
          type="password"
          class="w-full mb-6 p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Password"
          v-model="password"
        />
        <button
          class="text-white p-3 rounded-md hover:bg-indigo-700 w-full transition duration-200 ease-in-out"
          @click="fetchToken(email ?? '', password ?? '')"
        >
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsers } from "../../modules/auth/useUsers";

const { fetchToken, email, password } = useUsers();
</script>

<style lang="scss" scoped></style>
