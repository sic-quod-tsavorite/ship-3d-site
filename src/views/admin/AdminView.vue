<template>
  <div v-if="!auth.isLoggedIn" class="text-center">Loading...</div>
  <div v-else class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Admin Dashboard</h1>

    <VesselList
      :vessels="vessels"
      :loading="loading"
      :error="error"
      :get-image-url="getImageUrl"
      :get-object-url="getObjectUrl"
      @create="openCreateForm"
      @edit="openEditForm"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    />

    <VesselForm
      v-if="showForm"
      :vessel="selectedVessel"
      :loading="loading"
      :validate-image-file="validateImageFile"
      :validate-object-file="validateObjectFile"
      :get-image-url="getImageUrl"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// Project imports
import { useAdmin } from "@/modules/admin/useAdmin";
import VesselList from "@/components/admin/VesselList.vue";
import VesselForm from "@/components/admin/VesselForm.vue";

const {
  auth,
  vessels,
  loading,
  error,
  showForm,
  selectedVessel,
  validateImageFile,
  validateObjectFile,
  getImageUrl,
  getObjectUrl,
  openCreateForm,
  openEditForm,
  closeForm,
  handleSubmit,
  handleDelete,
  handleBatchDelete,
} = useAdmin();
</script>

<style lang="scss" scoped></style>
