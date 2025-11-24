<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <div
      class="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/60 backdrop-blur-lg px-8 py-10 text-slate-100"
    >
      <div class="mb-8 text-center">
        <p
          class="inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase text-indigo-400/90"
        >
          <span class="h-px w-6 bg-indigo-500/60"></span>
          Admin Access
          <span class="h-px w-6 bg-indigo-500/60"></span>
        </p>
        <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
          Sign in to console
        </h1>
        <p class="mt-2 text-sm text-slate-400">
          Enter your credentials to access admin panel.
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        aria-live="polite"
      >
        {{ error }}
      </div>

      <!-- Email Input -->
      <label class="block mb-4 text-sm">
        <span class="mb-1 inline-block text-slate-300">Email</span>
        <div
          class="relative flex items-center rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/40 transition"
        >
          <input
            ref="emailInput"
            type="email"
            class="w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            placeholder="you@example.com"
            v-model="email"
            :disabled="loading"
            @input="clearEmailError"
          />
        </div>
        <p v-if="emailError" class="mt-1 text-xs text-red-300">
          {{ emailError }}
        </p>
      </label>

      <!-- Password Input with Eye Icon -->
      <label class="block mb-6 text-sm">
        <span class="mb-1 inline-block text-slate-300">Password</span>
        <div
          class="relative flex items-center rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/40 transition"
        >
          <input
            :type="showPassword ? 'text' : 'password'"
            class="w-full bg-transparent pr-10 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            placeholder="••••••••"
            v-model="password"
            :disabled="loading"
            @input="clearPasswordError"
            @keyup.enter="handleLogin"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="bg-linear-to-r from-indigo-800 via-indigo-700 to-sky-800 transition hover:from-indigo-700 hover:via-sky-700 hover:to-sky-600"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <EyeIcon
              v-if="!showPassword"
              class="h-5 w-5 stroke-current text-white"
            />
            <EyeSlashIcon v-else class="h-5 w-5 stroke-current text-white" />
          </button>
        </div>
        <p v-if="passwordError" class="mt-1 text-xs text-red-300">
          {{ passwordError }}
        </p>
      </label>

      <!-- Login Button -->
      <button
        @click="handleLogin"
        :disabled="loading"
        :aria-busy="loading"
        class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
        ></span>
        <div
          v-if="loading"
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"
        ></div>
        <span class="relative z-10">
          {{ loading ? "Signing you in…" : "Sign in" }}
        </span>
      </button>

      <p class="mt-4 text-center text-xs text-slate-500">
        Access is restricted to authorized administrators.
      </p>
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
