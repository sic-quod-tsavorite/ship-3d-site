<template>
  <div class="w-full">
    <!-- Collapsible Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-left transition hover:bg-slate-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <h2 class="text-2xl font-semibold tracking-tight text-white">
        User Management
      </h2>
      <svg
        :class="[
          'h-6 w-6 text-slate-600 transition-transform duration-200',
          isExpanded ? 'rotate-180' : '',
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Collapsible Content -->
    <div
      v-show="isExpanded"
      class="space-y-6 overflow-hidden transition-all duration-300"
    >
      <!-- Update Own Password Section -->
      <div
        class="rounded-xl border border-indigo-200/60 bg-indigo-50/30 p-5 shadow-sm"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          Update Your Password
        </h3>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            v-model="currentUserPassword"
            type="password"
            placeholder="Enter new password"
            class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            @click="handleUpdateOwnPassword"
            :disabled="!currentUserPassword || loading"
            class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
            ></span>
            <span class="relative">
              {{ loading ? "Updating..." : "Update Password" }}
            </span>
          </button>
        </div>
      </div>

      <!-- Users List (Super users only) -->
      <div v-if="auth.userRole === 'super'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h3 class="text-lg font-semibold text-slate-900">All Users</h3>
          <div class="flex gap-2">
            <button
              @click="openCreateUserModal"
              class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
              ></span>
              <span class="relative">Create New User</span>
            </button>
            <button
              @click="fetchUsers"
              :disabled="loading"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? "Loading..." : "Refresh" }}
            </button>
          </div>
        </div>

        <div
          v-if="error"
          class="mb-4 rounded-xl border border-red-300/40 bg-red-50 p-4 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <div v-if="loading && !sortedUsers.length" class="py-8 text-center">
          <p class="text-sm text-slate-500">Loading users...</p>
        </div>

        <div v-else-if="sortedUsers.length === 0" class="py-8 text-center">
          <p class="text-sm text-slate-500">No users found.</p>
        </div>

        <div
          v-else
          class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm"
        >
          <table class="w-full border-collapse bg-white">
            <thead class="sticky top-0 z-10 bg-slate-50/80 backdrop-blur">
              <tr>
                <th
                  class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Role
                </th>
                <th
                  class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Name
                </th>
                <th
                  class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Email
                </th>
                <th
                  class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Registered
                </th>
                <th
                  class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in sortedUsers"
                :key="user._id"
                :class="[
                  'transition',
                  user._id === auth.userId
                    ? 'bg-indigo-50/40'
                    : 'hover:bg-slate-50',
                ]"
              >
                <td class="border-b border-slate-200 px-4 py-3">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      user.role === 'super'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800',
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="border-b border-slate-200 px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-900">
                      {{ user.name }}
                    </span>
                    <span
                      v-if="user._id === auth.userId"
                      class="text-xs text-slate-500"
                    >
                      (You)
                    </span>
                  </div>
                </td>
                <td class="border-b border-slate-200 px-4 py-3">
                  <span class="text-sm text-slate-600">
                    {{ user.email }}
                  </span>
                </td>
                <td class="border-b border-slate-200 px-4 py-3">
                  <span class="text-xs text-slate-500">
                    {{ formatDate(user.registeredAt) }}
                  </span>
                </td>
                <td class="border-b border-slate-200 px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <!-- Reset Password Button (only for admin users) -->
                    <button
                      v-if="canModifyUser(user)"
                      @click="openPasswordModal(user)"
                      class="group relative overflow-hidden rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-orange-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-amber-500/30 transition hover:from-amber-400 hover:via-orange-400 hover:to-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <span
                        class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                      ></span>
                      <span class="relative">Reset Password</span>
                    </button>

                    <!-- Delete Button (only for admins) -->
                    <button
                      v-if="user.role !== 'super' && user._id !== auth.userId"
                      @click="handleDeleteUser(user)"
                      class="group relative overflow-hidden rounded-xl bg-linear-to-r from-red-500 via-red-400 to-pink-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-red-500/30 transition hover:from-red-400 hover:via-pink-400 hover:to-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <span
                        class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                      ></span>
                      <span class="relative">Delete</span>
                    </button>

                    <!-- Protected indicator for other super users -->
                    <span
                      v-if="user.role === 'super' && user._id !== auth.userId"
                      class="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-500"
                    >
                      Protected
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 text-xs font-medium text-slate-600">
          Showing {{ sortedUsers.length }} user{{
            sortedUsers.length !== 1 ? "s" : ""
          }}
        </div>
      </div>

      <!-- Non-super users can't see other users -->
      <div
        v-else
        class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center"
      >
        <p class="text-sm text-slate-500">
          Only super users can view and manage other users.
        </p>
      </div>
    </div>

    <!-- Password Reset Modal -->
    <Teleport to="body">
      <div
        v-if="selectedUser"
        class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="closePasswordModal"
      >
        <div
          class="slide-in-scale relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <h3 class="mb-4 text-xl font-semibold text-slate-900">
            Reset Password for {{ selectedUser.name }}
          </h3>
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              v-model="modalPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              @keyup.enter="handleUpdateUserPassword"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              @click="closePasswordModal"
              class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              @click="handleUpdateUserPassword"
              :disabled="!modalPassword || loading"
              class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
              ></span>
              <span class="relative">
                {{ loading ? "Resetting..." : "Reset Password" }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create User Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateUserModal"
        class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="closeCreateUserModal"
      >
        <div
          class="slide-in-scale relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <h3 class="mb-4 text-xl font-semibold text-slate-900">
            Create New User
          </h3>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                v-model="newUser.name"
                type="text"
                placeholder="Enter name"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                v-model="newUser.email"
                type="email"
                placeholder="Enter email"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                v-model="newUser.password"
                type="password"
                placeholder="Enter password"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                @keyup.enter="handleCreateUser"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                v-model="newUser.role"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="admin">Admin</option>
                <option value="super">Super ⚠️</option>
              </select>
              <p
                v-if="newUser.role === 'super'"
                class="mt-2 text-xs text-amber-600"
              >
                ⚠️ Super users can only be deleted directly in the database and
                have management privileges over lower ranking users.
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closeCreateUserModal"
              class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              @click="handleCreateUser"
              :disabled="!isCreateUserFormValid || loading"
              class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
              ></span>
              <span class="relative">
                {{ loading ? "Creating..." : "Create User" }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, onMounted } from "vue";

// Project imports
import { useUserManagement } from "@/modules/auth/useUserManagement";
import { useUserList } from "@/modules/auth/useUserList";
import { useUserActions } from "@/modules/auth/useUserActions";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

// API operations composable
const {
  users,
  loading,
  error,
  fetchUsers,
  updatePassword,
  updateCurrentUserPassword,
  deleteUser,
  createUser,
} = useUserManagement();

// UI state composable
const {
  currentUserPassword,
  selectedUser,
  modalPassword,
  showCreateUserModal,
  newUser,
  sortedUsers,
  isCreateUserFormValid,
  canModifyUser,
  openPasswordModal,
  closePasswordModal,
  openCreateUserModal,
  closeCreateUserModal,
  formatDate,
} = useUserList(users);

// User actions composable
const {
  handleUpdateOwnPassword,
  handleUpdateUserPassword,
  handleCreateUser,
  handleDeleteUser,
} = useUserActions(
  updatePassword,
  updateCurrentUserPassword,
  createUser,
  deleteUser,
  error,
  currentUserPassword,
  selectedUser,
  modalPassword,
  newUser,
  isCreateUserFormValid,
  closePasswordModal,
  closeCreateUserModal
);

// Local component state
const isExpanded = ref(false);

// Fetch users on mount if user is super
onMounted(async () => {
  if (auth.userRole === "super") {
    await fetchUsers();
  }
});
</script>

<style lang="scss" scoped>
.slide-in-scale {
  animation: slideInScale 0.2s ease-out;
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
