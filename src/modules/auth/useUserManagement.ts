// Imports
import { ref } from "vue";
import type { Ref } from "vue";

// Project imports
import type { User } from "@/interfaces/userInterfaces";
import { useAuthStore } from "@/stores/auth";

export const useUserManagement = (): {
  users: Ref<User[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchUsers: () => Promise<void>;
  updatePassword: (userId: string, newPassword: string) => Promise<boolean>;
  updateCurrentUserPassword: (newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  createUser: (
    name: string,
    email: string,
    password: string,
    role: "super" | "admin"
  ) => Promise<boolean>;
} => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const auth = useAuthStore();

  const users = ref<User[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all users from the API
   */
  const fetchUsers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(API_URL + "/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Access denied - please login");
        } else if (response.status === 403) {
          throw new Error("Forbidden: Higher admin privileges required");
        }
        throw new Error("Failed to fetch users");
      }

      const result = (await response.json()) as {
        error?: string | null;
        data?: User[];
      };
      users.value = result.data ?? [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      users.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset password for any (non-super) user (super users only)
   * Uses endpoint: PUT /user/:id/password
   */
  const updatePassword = async (
    userId: string,
    newPassword: string
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(API_URL + `/user/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to update password");
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update password for the currently logged-in user
   */
  const updateCurrentUserPassword = async (
    newPassword: string
  ): Promise<boolean> => {
    if (!auth.userId) {
      error.value = "No user logged in";
      return false;
    }

    return await updatePassword(auth.userId, newPassword);
  };

  /**
   * Create a new user (super users only)
   */
  const createUser = async (
    name: string,
    email: string,
    password: string,
    role: "super" | "admin"
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(API_URL + "/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to create user");
      }

      // Refresh users list after creating
      await fetchUsers();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a user (super users can't delete other super users)
   */
  const deleteUser = async (userId: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(API_URL + `/user/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to delete user");
      }

      // Remove user from local state
      users.value = users.value.filter((user) => user._id !== userId);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updatePassword,
    updateCurrentUserPassword,
    deleteUser,
    createUser,
  };
};
