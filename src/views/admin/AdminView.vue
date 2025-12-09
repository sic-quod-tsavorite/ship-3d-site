<template>
  <div
    v-if="!auth.isLoggedIn"
    class="flex min-h-screen items-center justify-center text-sm text-slate-500"
  >
    Loading...
  </div>
  <div v-else class="min-h-screen w-full px-4 py-10 text-slate-900 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-10 text-center">
        <p
          class="mx-auto mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.35em] uppercase text-indigo-500/80"
        >
          <span class="h-px w-8 bg-indigo-500/60"></span>
          Admin Console
          <span class="h-px w-8 bg-indigo-500/60"></span>
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          Manage vessels, users, and assets. Perform create, edit and removal
          operations below.
        </p>
      </div>

      <!-- User Management Section -->
      <div
        class="mb-6 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 backdrop-blur-sm px-5 py-6"
      >
        <UserManagement />
      </div>

      <!-- Vessels Section -->
      <div
        class="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 backdrop-blur-sm px-5 py-6"
      >
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
      </div>

      <VesselForm
        v-if="showForm"
        :vessel="selectedVessel"
        :vessels="vessels"
        :loading="loading"
        :validate-image-file="validateImageFile"
        :validate-object-file="validateObjectFile"
        :get-image-url="getImageUrl"
        @close="closeForm"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Project imports
import { useAdmin } from "@/modules/admin/useAdmin";
import VesselList from "@/components/admin/VesselList.vue";
import VesselForm from "@/components/admin/VesselForm.vue";
import UserManagement from "@/components/admin/UserManagement.vue";

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
