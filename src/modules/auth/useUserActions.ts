// Imports
import type { Ref } from "vue";

// Project imports
import type { User } from "@/interfaces/userInterfaces";

export const useUserActions = (
  updatePassword: (userId: string, newPassword: string) => Promise<boolean>,
  updateCurrentUserPassword: (newPassword: string) => Promise<boolean>,
  createUser: (
    name: string,
    email: string,
    password: string,
    role: "super" | "admin"
  ) => Promise<boolean>,
  deleteUser: (userId: string) => Promise<boolean>,
  error: Ref<string | null>,
  currentUserPassword: Ref<string>,
  selectedUser: Ref<User | null>,
  modalPassword: Ref<string>,
  newUser: Ref<{
    name: string;
    email: string;
    password: string;
    role: "super" | "admin";
  }>,
  isCreateUserFormValid: Ref<boolean>,
  closePasswordModal: () => void,
  closeCreateUserModal: () => void
): {
  handleUpdateOwnPassword: () => Promise<void>;
  handleUpdateUserPassword: () => Promise<void>;
  handleCreateUser: () => Promise<void>;
  handleDeleteUser: (user: User) => Promise<void>;
} => {
  /**
   * Handle updating current user's password
   */
  const handleUpdateOwnPassword = async (): Promise<void> => {
    if (!currentUserPassword.value) return;

    const success = await updateCurrentUserPassword(currentUserPassword.value);

    if (success) {
      alert("Password updated successfully!");
      currentUserPassword.value = "";
    } else {
      alert(`Failed to update password: ${error.value ?? "Unknown error"}`);
    }
  };

  /**
   * Handle resetting another user's password
   */
  const handleUpdateUserPassword = async (): Promise<void> => {
    if (!selectedUser.value || !modalPassword.value) return;

    const success = await updatePassword(
      selectedUser.value._id,
      modalPassword.value
    );

    if (success) {
      alert(`Password reset successfully for ${selectedUser.value.name}!`);
      closePasswordModal();
    } else {
      alert(`Failed to reset password: ${error.value ?? "Unknown error"}`);
    }
  };

  /**
   * Handle creating a new user
   */
  const handleCreateUser = async (): Promise<void> => {
    if (!isCreateUserFormValid.value) return;

    const role: "super" | "admin" = newUser.value.role;
    const success = await createUser(
      newUser.value.name,
      newUser.value.email,
      newUser.value.password,
      role
    );

    if (success) {
      alert(`User "${newUser.value.name}" created successfully!`);
      closeCreateUserModal();
    } else {
      alert(`Failed to create user: ${error.value ?? "Unknown error"}`);
    }
  };

  /**
   * Handle deleting a user
   */
  const handleDeleteUser = async (user: User): Promise<void> => {
    if (
      !confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const success = await deleteUser(user._id);

    if (success) {
      alert(`User "${user.name}" deleted successfully!`);
    } else {
      alert(`Failed to delete user: ${error.value ?? "Unknown error"}`);
    }
  };

  return {
    handleUpdateOwnPassword,
    handleUpdateUserPassword,
    handleCreateUser,
    handleDeleteUser,
  };
};
