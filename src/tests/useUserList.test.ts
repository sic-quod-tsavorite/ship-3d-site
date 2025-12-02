// Imports
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";

// Project imports
import type { User } from "@/interfaces/userInterfaces";
import { useUserList } from "@/modules/auth/useUserList";
import { useAuthStore } from "@/stores/auth";

// Mock the auth store
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

const usersSample: User[] = [
  {
    _id: "user1",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin",
    registeredAt: "2024-01-15T10:30:00.000Z",
  },
  {
    _id: "user2",
    name: "Bob Super",
    email: "bob@example.com",
    role: "super",
    registeredAt: "2024-01-01T08:00:00.000Z",
  },
  {
    _id: "user3",
    name: "Charlie Admin",
    email: "charlie@example.com",
    role: "admin",
    registeredAt: "2024-02-20T14:45:00.000Z",
  },
  {
    _id: "user4",
    name: "Diana Super",
    email: "diana@example.com",
    role: "super",
    registeredAt: "2024-01-10T09:15:00.000Z",
  },
];

describe("useUserList", (): void => {
  beforeEach(() => {
    // Reset auth store mock before each test
    vi.mocked(useAuthStore).mockReturnValue({
      userId: "user2",
      userRole: "super",
      isLoggedIn: true,
      userName: "Bob Super",
      userEmail: "bob@example.com",
      login: vi.fn(),
      logout: vi.fn(),
      initAuth: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  it("sorts users with current user first, then other supers, then admins", (): void => {
    const api = useUserList(ref([...usersSample]));

    const sorted = api.sortedUsers.value;
    expect(sorted.map((u) => u._id)).toEqual([
      "user2", // Current user (Bob Super) first
      "user4", // Other super (Diana)
      "user1", // Admin (Alice)
      "user3", // Admin (Charlie)
    ]);
  });

  it("sorts users alphabetically within same role", (): void => {
    const users: User[] = [
      {
        _id: "admin1",
        name: "Zoe Admin",
        email: "zoe@example.com",
        role: "admin",
        registeredAt: "2024-01-01T00:00:00.000Z",
      },
      {
        _id: "admin2",
        name: "Alice Admin",
        email: "alice@example.com",
        role: "admin",
        registeredAt: "2024-01-02T00:00:00.000Z",
      },
      {
        _id: "admin3",
        name: "Mike Admin",
        email: "mike@example.com",
        role: "admin",
        registeredAt: "2024-01-03T00:00:00.000Z",
      },
    ];

    vi.mocked(useAuthStore).mockReturnValue({
      userId: "admin1",
      userRole: "admin",
      isLoggedIn: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    const api = useUserList(ref(users));

    const sorted = api.sortedUsers.value;
    expect(sorted.map((u) => u.name)).toEqual([
      "Zoe Admin", // Current user first
      "Alice Admin", // Alphabetical
      "Mike Admin", // Alphabetical
    ]);
  });

  it("validates create user form correctly", (): void => {
    const api = useUserList(ref([]));

    // Initially invalid (empty fields)
    expect(api.isCreateUserFormValid.value).toBe(false);

    // Fill in name only
    api.newUser.value.name = "Test User";
    expect(api.isCreateUserFormValid.value).toBe(false);

    // Fill in email
    api.newUser.value.email = "test@example.com";
    expect(api.isCreateUserFormValid.value).toBe(false);

    // Fill in password - now valid
    api.newUser.value.password = "password123";
    expect(api.isCreateUserFormValid.value).toBe(true);

    // Empty password should invalidate
    api.newUser.value.password = "   ";
    expect(api.isCreateUserFormValid.value).toBe(false);
  });

  it("checks if super user can modify admin users", (): void => {
    const api = useUserList(ref([...usersSample]));

    const adminUser = usersSample.find((u) => u.role === "admin");
    expect(adminUser).toBeDefined();
    if (adminUser) {
      expect(api.canModifyUser(adminUser)).toBe(true);
    }
  });

  it("checks that super user cannot modify other super users", (): void => {
    const api = useUserList(ref([...usersSample]));

    const otherSuperUser = usersSample.find(
      (u) => u.role === "super" && u._id !== "user2"
    );
    expect(otherSuperUser).toBeDefined();
    if (otherSuperUser) {
      expect(api.canModifyUser(otherSuperUser)).toBe(false);
    }
  });

  it("checks that super user cannot modify themselves", (): void => {
    const api = useUserList(ref([...usersSample]));

    const currentUser = usersSample.find((u) => u._id === "user2");
    expect(currentUser).toBeDefined();
    if (currentUser) {
      expect(api.canModifyUser(currentUser)).toBe(false);
    }
  });

  it("checks that admin user cannot modify any users", (): void => {
    vi.mocked(useAuthStore).mockReturnValue({
      userId: "user1",
      userRole: "admin",
      isLoggedIn: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    const api = useUserList(ref([...usersSample]));

    // Admin cannot modify other admins
    expect(api.canModifyUser(usersSample[2])).toBe(false);
    // Admin cannot modify super users
    expect(api.canModifyUser(usersSample[1])).toBe(false);
  });

  it("formats dates correctly", (): void => {
    const api = useUserList(ref([]));

    const formatted = api.formatDate("2024-01-15T10:30:00.000Z");
    expect(formatted).toMatch(/15.*Jan.*2024/);
  });

  it("opens and closes password modal", (): void => {
    const api = useUserList(ref([...usersSample]));

    expect(api.selectedUser.value).toBeNull();
    expect(api.modalPassword.value).toBe("");

    api.openPasswordModal(usersSample[0]);
    expect(api.selectedUser.value).toEqual(usersSample[0]);
    expect(api.modalPassword.value).toBe("");

    api.modalPassword.value = "newpassword";
    api.closePasswordModal();
    expect(api.selectedUser.value).toBeNull();
    expect(api.modalPassword.value).toBe("");
  });

  it("opens and closes create user modal", (): void => {
    const api = useUserList(ref([]));

    expect(api.showCreateUserModal.value).toBe(false);

    api.openCreateUserModal();
    expect(api.showCreateUserModal.value).toBe(true);
    expect(api.newUser.value).toEqual({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });

    // Modify the form
    api.newUser.value.name = "Test";
    api.newUser.value.email = "test@example.com";
    api.newUser.value.password = "pass123";

    // Close modal - should reset
    api.closeCreateUserModal();
    expect(api.showCreateUserModal.value).toBe(false);
    expect(api.newUser.value).toEqual({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
  });

  it("clears password input when opening modal", (): void => {
    const api = useUserList(ref([...usersSample]));

    api.modalPassword.value = "oldpassword";
    api.openPasswordModal(usersSample[0]);
    expect(api.modalPassword.value).toBe("");
  });

  it("maintains current user password state separately", (): void => {
    const api = useUserList(ref([]));

    expect(api.currentUserPassword.value).toBe("");

    api.currentUserPassword.value = "mypassword";
    expect(api.currentUserPassword.value).toBe("mypassword");

    // Opening modal shouldn't affect currentUserPassword
    api.openPasswordModal(usersSample[0]);
    expect(api.currentUserPassword.value).toBe("mypassword");
    expect(api.modalPassword.value).toBe("");
  });
});
