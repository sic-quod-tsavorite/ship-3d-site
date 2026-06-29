// Imports
import { ref, computed, type Ref, type ComputedRef } from "vue";

// Project imports
import type { User } from "@/interfaces/userInterfaces";
import { useAuthStore } from "@/stores/auth";
import { validatePassword } from "@/utils/validationHelpers";

export const useUserList = (
  users: Ref<User[]>
): {
  currentPassword: Ref<string>;
  newPassword: Ref<string>;
  confirmNewPassword: Ref<string>;
  selectedUser: Ref<User | null>;
  modalPassword: Ref<string>;
  showCreateUserModal: Ref<boolean>;
  newUser: Ref<{
    name: string;
    email: string;
    password: string;
    role: "super" | "admin";
  }>;
  sortedUsers: ComputedRef<User[]>;
  isCreateUserFormValid: ComputedRef<boolean>;
  isUpdateOwnPasswordValid: ComputedRef<boolean>;
  updateOwnPasswordError: ComputedRef<string | null>;
  canModifyUser: (targetUser: User) => boolean;
  openPasswordModal: (user: User) => void;
  closePasswordModal: () => void;
  openCreateUserModal: () => void;
  closeCreateUserModal: () => void;
  formatDate: (dateString: string) => string;
} => {
  const auth = useAuthStore();

  // State for updating own password
  const currentPassword = ref<string>("");
  const newPassword = ref<string>("");
  const confirmNewPassword = ref<string>("");

  // State for other functionality
  const selectedUser = ref<User | null>(null);
  const modalPassword = ref<string>("");
  const showCreateUserModal = ref<boolean>(false);
  const newUser = ref<{
    name: string;
    email: string;
    password: string;
    role: "super" | "admin";
  }>({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  /**
   * Sort users: current user first, then other super users, then admins
   */
  const sortedUsers = computed(() => {
    return [...users.value].sort((a, b) => {
      // Current user always first
      if (a._id === auth.userId) return -1;
      if (b._id === auth.userId) return 1;

      // Super users come before admins
      if (a.role === "super" && b.role !== "super") return -1;
      if (a.role !== "super" && b.role === "super") return 1;

      // Within same role, sort by name
      return a.name.localeCompare(b.name);
    });
  });

  /**
   * Check if create user form is valid
   */
  const isCreateUserFormValid = computed(() => {
    return (
      newUser.value.name.trim() !== "" &&
      newUser.value.email.trim() !== "" &&
      newUser.value.password.trim() !== ""
    );
  });

  /**
   * Check if own password update form is valid
   */
  const isUpdateOwnPasswordValid = computed((): boolean => {
    // All fields must be non-empty
    if (
      !currentPassword.value.trim() ||
      !newPassword.value.trim() ||
      !confirmNewPassword.value.trim()
    ) {
      return false;
    }

    // New passwords must match
    if (newPassword.value !== confirmNewPassword.value) {
      return false;
    }

    // New password must pass validation
    const validation = validatePassword(newPassword.value);
    return validation.isValid;
  });

  /**
   * Get error message for own password update form
   */
  const updateOwnPasswordError = computed((): string | null => {
    // Don't show errors for empty form
    if (!newPassword.value && !confirmNewPassword.value) {
      return null;
    }

    // Check if passwords match
    if (newPassword.value !== confirmNewPassword.value) {
      return "Passwords don't match";
    }

    // Check password validation
    const validation = validatePassword(newPassword.value);
    return validation.error;
  });

  /**
   * Check if current user can modify target user
   */
  const canModifyUser = (targetUser: User): boolean => {
    // Current user must be super
    if (auth.userRole !== "super") return false;
    // Can't modify any super users (including themselves)
    if (targetUser.role === "super") return false;
    // Can only modify admin users
    return true;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Open password reset modal for a user
   */
  const openPasswordModal = (user: User): void => {
    selectedUser.value = user;
    modalPassword.value = "";
  };

  /**
   * Close password reset modal
   */
  const closePasswordModal = (): void => {
    selectedUser.value = null;
    modalPassword.value = "";
  };

  /**
   * Open create user modal
   */
  const openCreateUserModal = (): void => {
    newUser.value = {
      name: "",
      email: "",
      password: "",
      role: "admin",
    };
    showCreateUserModal.value = true;
  };

  /**
   * Close create user modal
   */
  const closeCreateUserModal = (): void => {
    showCreateUserModal.value = false;
    newUser.value = {
      name: "",
      email: "",
      password: "",
      role: "admin",
    };
  };

  return {
    // State for updating own password
    currentPassword,
    newPassword,
    confirmNewPassword,

    // State for other functionality
    selectedUser,
    modalPassword,
    showCreateUserModal,
    newUser,

    // Computed
    sortedUsers,
    isCreateUserFormValid,
    isUpdateOwnPasswordValid,
    updateOwnPasswordError,

    // Methods
    canModifyUser,
    openPasswordModal,
    closePasswordModal,
    openCreateUserModal,
    closeCreateUserModal,
    formatDate,
  };
};
