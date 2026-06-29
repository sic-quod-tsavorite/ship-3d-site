// Imports
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, type Ref } from "vue";

// Project imports
import { useUserActions } from "@/modules/auth/useUserActions";
import type { User } from "@/interfaces/userInterfaces";

describe("useUserActions", (): void => {
  let updatePasswordMock: ReturnType<
    typeof vi.fn<(userId: string, newPassword: string) => Promise<boolean>>
  >;
  let updateCurrentUserPasswordMock: ReturnType<
    typeof vi.fn<
      (currentPassword: string, newPassword: string) => Promise<boolean>
    >
  >;
  let createUserMock: ReturnType<
    typeof vi.fn<
      (
        name: string,
        email: string,
        password: string,
        role: "super" | "admin"
      ) => Promise<boolean>
    >
  >;
  let deleteUserMock: ReturnType<
    typeof vi.fn<(userId: string) => Promise<boolean>>
  >;
  let closePasswordModalMock: ReturnType<typeof vi.fn<() => void>>;
  let closeCreateUserModalMock: ReturnType<typeof vi.fn<() => void>>;
  let errorRef: Ref<string | null>;
  let currentPasswordRef: Ref<string>;
  let newPasswordRef: Ref<string>;
  let confirmNewPasswordRef: Ref<string>;
  let isUpdateOwnPasswordValidRef: Ref<boolean>;
  let selectedUserRef: Ref<User | null>;
  let modalPasswordRef: Ref<string>;
  let newUserRef: Ref<{
    name: string;
    email: string;
    password: string;
    role: "super" | "admin";
  }>;
  let isCreateUserFormValidRef: Ref<boolean>;

  // Mock alert and confirm

  beforeEach((): void => {
    // Reset mocks
    updatePasswordMock = vi.fn();
    updateCurrentUserPasswordMock = vi.fn();
    createUserMock = vi.fn();
    deleteUserMock = vi.fn();
    closePasswordModalMock = vi.fn();
    closeCreateUserModalMock = vi.fn();

    // Reset refs
    errorRef = ref<string | null>(null);
    currentPasswordRef = ref("");
    newPasswordRef = ref("");
    confirmNewPasswordRef = ref("");
    isUpdateOwnPasswordValidRef = ref(false);
    selectedUserRef = ref<User | null>(null);
    modalPasswordRef = ref("");
    newUserRef = ref({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
    isCreateUserFormValidRef = ref(false);

    // Mock global functions
    global.alert = vi.fn();
    global.confirm = vi.fn();
  });

  it("handles update own password successfully", async (): Promise<void> => {
    updateCurrentUserPasswordMock.mockResolvedValueOnce(true);
    isUpdateOwnPasswordValidRef.value = true;
    currentPasswordRef.value = "oldPassword123";
    newPasswordRef.value = "newPassword123";
    confirmNewPasswordRef.value = "newPassword123";

    const { handleUpdateOwnPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateOwnPassword();

    expect(updateCurrentUserPasswordMock).toHaveBeenCalledWith(
      "oldPassword123",
      "newPassword123"
    );
    expect(global.alert).toHaveBeenCalledWith("Password updated successfully!");
    expect(currentPasswordRef.value).toBe("");
    expect(newPasswordRef.value).toBe("");
    expect(confirmNewPasswordRef.value).toBe("");
  });

  it("handles update own password failure", async (): Promise<void> => {
    updateCurrentUserPasswordMock.mockResolvedValueOnce(false);
    errorRef.value = "Password too weak";
    currentPasswordRef.value = "oldPassword";
    newPasswordRef.value = "weak";
    confirmNewPasswordRef.value = "weak";
    isUpdateOwnPasswordValidRef.value = true;

    const { handleUpdateOwnPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateOwnPassword();

    expect(global.alert).toHaveBeenCalledWith(
      "Failed to update password: Password too weak"
    );
    expect(currentPasswordRef.value).toBe("oldPassword");
  });

  it("does not update own password if field is empty", async (): Promise<void> => {
    isUpdateOwnPasswordValidRef.value = false;

    const { handleUpdateOwnPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateOwnPassword();

    expect(updateCurrentUserPasswordMock).not.toHaveBeenCalled();
  });

  it("handles reset another user's password successfully", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    selectedUserRef.value = mockUser;
    modalPasswordRef.value = "newPassword456";
    updatePasswordMock.mockResolvedValueOnce(true);

    const { handleUpdateUserPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateUserPassword();

    expect(updatePasswordMock).toHaveBeenCalledWith(
      "user123",
      "newPassword456"
    );
    expect(global.alert).toHaveBeenCalledWith(
      "Password reset successfully for Test User!"
    );
    expect(closePasswordModalMock).toHaveBeenCalled();
  });

  it("handles reset another user's password failure", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    selectedUserRef.value = mockUser;
    modalPasswordRef.value = "newPassword";
    updatePasswordMock.mockResolvedValueOnce(false);
    errorRef.value = "Forbidden";

    const { handleUpdateUserPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateUserPassword();

    expect(global.alert).toHaveBeenCalledWith(
      "Failed to reset password: Forbidden"
    );
    expect(closePasswordModalMock).not.toHaveBeenCalled();
  });

  it("does not reset password if no user selected", async (): Promise<void> => {
    selectedUserRef.value = null;
    modalPasswordRef.value = "password";

    const { handleUpdateUserPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateUserPassword();

    expect(updatePasswordMock).not.toHaveBeenCalled();
  });

  it("does not reset password if password field is empty", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    selectedUserRef.value = mockUser;
    modalPasswordRef.value = "";

    const { handleUpdateUserPassword } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleUpdateUserPassword();

    expect(updatePasswordMock).not.toHaveBeenCalled();
  });

  it("handles create user successfully", async (): Promise<void> => {
    newUserRef.value = {
      name: "New User",
      email: "new@example.com",
      password: "password123",
      role: "admin",
    };
    isCreateUserFormValidRef.value = true;
    createUserMock.mockResolvedValueOnce(true);

    const { handleCreateUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleCreateUser();

    expect(createUserMock).toHaveBeenCalledWith(
      "New User",
      "new@example.com",
      "password123",
      "admin"
    );
    expect(global.alert).toHaveBeenCalledWith(
      'User "New User" created successfully!'
    );
    expect(closeCreateUserModalMock).toHaveBeenCalled();
  });

  it("handles create user with super role", async (): Promise<void> => {
    newUserRef.value = {
      name: "Super User",
      email: "super@example.com",
      password: "password456",
      role: "super",
    };
    isCreateUserFormValidRef.value = true;
    createUserMock.mockResolvedValueOnce(true);

    const { handleCreateUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleCreateUser();

    expect(createUserMock).toHaveBeenCalledWith(
      "Super User",
      "super@example.com",
      "password456",
      "super"
    );
  });

  it("handles create user failure", async (): Promise<void> => {
    newUserRef.value = {
      name: "New User",
      email: "new@example.com",
      password: "password123",
      role: "admin",
    };
    isCreateUserFormValidRef.value = true;
    createUserMock.mockResolvedValueOnce(false);
    errorRef.value = "Email already exists";

    const { handleCreateUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleCreateUser();

    expect(global.alert).toHaveBeenCalledWith(
      "Failed to create user: Email already exists"
    );
    expect(closeCreateUserModalMock).not.toHaveBeenCalled();
  });

  it("does not create user if form is invalid", async (): Promise<void> => {
    newUserRef.value = {
      name: "",
      email: "",
      password: "",
      role: "admin",
    };
    isCreateUserFormValidRef.value = false;

    const { handleCreateUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleCreateUser();

    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("handles delete user successfully after confirmation", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    deleteUserMock.mockResolvedValueOnce(true);

    const { handleDeleteUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleDeleteUser(mockUser);

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete user "Test User"? This action cannot be undone.'
    );
    expect(deleteUserMock).toHaveBeenCalledWith("user123");
    expect(global.alert).toHaveBeenCalledWith(
      'User "Test User" deleted successfully!'
    );
  });

  it("handles delete user failure", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    deleteUserMock.mockResolvedValueOnce(false);
    errorRef.value = "Cannot delete user";

    const { handleDeleteUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleDeleteUser(mockUser);

    expect(global.alert).toHaveBeenCalledWith(
      "Failed to delete user: Cannot delete user"
    );
  });

  it("does not delete user if confirmation is cancelled", async (): Promise<void> => {
    const mockUser: User = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00.000Z",
    };

    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

    const { handleDeleteUser } = useUserActions(
      updatePasswordMock,
      updateCurrentUserPasswordMock,
      createUserMock,
      deleteUserMock,
      errorRef,
      currentPasswordRef,
      newPasswordRef,
      confirmNewPasswordRef,
      isUpdateOwnPasswordValidRef,
      selectedUserRef,
      modalPasswordRef,
      newUserRef,
      isCreateUserFormValidRef,
      closePasswordModalMock,
      closeCreateUserModalMock
    );

    await handleDeleteUser(mockUser);

    expect(deleteUserMock).not.toHaveBeenCalled();
  });
});
