<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <a href="#" class="font-bold text-xl">MySite</a>
      <div class="space-x-4">
        <RouterLink to="/" class="mr-4">Home</RouterLink>
        <RouterLink to="/admin" class="mr-4">Admin</RouterLink>
        <a href="#" class="hover:text-gray-300">About</a>
        <a href="#" class="hover:text-gray-300">Contact</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
