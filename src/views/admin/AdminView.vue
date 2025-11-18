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
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useVessels } from "@/modules/vessels/useVessels";
import VesselList from "@/components/admin/VesselList.vue";
import VesselForm from "@/components/admin/VesselForm.vue";
import type { Vessel } from "@/interfaces/vesselInterfaces";

const router = useRouter();
const auth = useAuthStore();

const {
  vessels,
  loading,
  error,
  fetchVessels,
  createVessel,
  updateVessel,
  deleteVessel,
  validateImageFile,
  validateObjectFile,
  getImageUrl,
  getObjectUrl,
} = useVessels();

const showForm = ref<boolean>(false);
const selectedVessel = ref<Vessel | undefined>(undefined);

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push("/login");
  } else {
    await fetchVessels();
  }
});

watch(
  () => auth.isLoggedIn,
  async (val) => {
    if (val) {
      await fetchVessels();
    }
  },
  { immediate: false }
);

const openCreateForm = (): void => {
  selectedVessel.value = undefined;
  showForm.value = true;
};

const openEditForm = (vessel: Vessel): void => {
  selectedVessel.value = vessel;
  showForm.value = true;
};

const closeForm = (): void => {
  showForm.value = false;
  selectedVessel.value = undefined;
};

const handleSubmit = async (data: {
  name: string;
  description: string;
  imageFile: File | null;
  objectFile: File | null;
}): Promise<void> => {
  let success = false;

  if (selectedVessel.value) {
    // Update existing vessel
    success = await updateVessel({
      _id: selectedVessel.value._id,
      name: data.name,
      description: data.description,
      imageFile: data.imageFile,
      objectFile: data.objectFile,
    });
  } else {
    // Create new vessel
    success = await createVessel({
      name: data.name,
      description: data.description,
      imageFile: data.imageFile,
      objectFile: data.objectFile,
    });
  }

  if (success) {
    closeForm();
  }
};

const handleDelete = async (id: string): Promise<void> => {
  await deleteVessel(id);
};

const handleBatchDelete = async (ids: string[]): Promise<void> => {
  for (const id of ids) {
    await deleteVessel(id);
  }
};
</script>

<style lang="scss" scoped></style>
