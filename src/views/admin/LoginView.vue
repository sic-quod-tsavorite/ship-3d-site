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

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-4 rounded bg-red-100 p-3 text-red-700"
          aria-live="polite"
        >
          {{ error }}
        </div>

        <!-- Email Input -->
        <input
          ref="emailInput"
          type="email"
          class="w-full mb-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Email"
          v-model="email"
          :disabled="loading"
          @input="clearEmailError"
        />
        <p v-if="emailError" class="mt-1 mb-3 text-sm text-red-600">
          {{ emailError }}
        </p>

        <!-- Password Input with Eye Icon -->
        <div class="relative mb-1">
          <input
            :type="showPassword ? 'text' : 'password'"
            class="w-full p-3 pr-12 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            v-model="password"
            :disabled="loading"
            @input="clearPasswordError"
            @keyup.enter="handleLogin"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <EyeIcon v-if="!showPassword" class="h-5 w-5" />
            <EyeSlashIcon v-else class="h-5 w-5" />
          </button>
        </div>
        <p v-if="passwordError" class="mt-1 mb-3 text-sm text-red-600">
          {{ passwordError }}
        </p>

        <!-- Login Button -->
        <button
          @click="handleLogin"
          :disabled="loading"
          :aria-busy="loading"
          class="bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 w-full transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-indigo-400 flex items-center justify-center gap-2"
        >
          <div
            v-if="loading"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"
          ></div>
          <span>{{ loading ? "Logging in..." : "Login" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

// Project imports
import { useLogin } from "@/modules/auth/useLogin";

const {
  email,
  password,
  error,
  loading,
  emailError,
  passwordError,
  showPassword,
  emailInput,
  handleLogin,
  clearEmailError,
  clearPasswordError,
} = useLogin();
</script>

<style lang="scss" scoped></style>
