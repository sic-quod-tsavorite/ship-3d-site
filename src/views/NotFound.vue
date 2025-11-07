<template>
  <div class="not-found">
    <h1>Error: 404</h1>
    <p>The page you are looking for does not exist.</p>
    <p v-if="path">
      The page
      <code>{{ path }}</code>
      was not found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const path = computed(() =>
  (route.params.pathMatch as string[] | undefined)?.join("/")
);
</script>

<style lang="scss" scoped>
.not-found {
  text-align: center;
  margin-top: 5rem;
  font-size: 1.2rem;

  h1 {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  code {
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    color: #e01e5a;
  }
}
</style>
