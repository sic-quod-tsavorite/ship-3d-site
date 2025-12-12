// Imports
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Project imports
import { useUserManagement } from "@/modules/auth/useUserManagement";
import type { User } from "@/interfaces/userInterfaces";

const API = "http://api.test";

// Mock the auth store
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(() => ({
    userId: "currentUserId",
    userRole: "super",
    isLoggedIn: true,
    userName: "Test User",
    userEmail: "test@example.com",
    login: vi.fn(),
    logout: vi.fn(),
    initAuth: vi.fn(),
  })),
}));

describe("useUserManagement", (): void => {
  beforeEach((): void => {
    vi.stubEnv("VITE_API_URL", API);
    vi.restoreAllMocks();
  });

  afterEach((): void => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("fetches users successfully", async (): Promise<void> => {
    const mockUsers: User[] = [
      {
        _id: "1",
        name: "Alice",
        email: "alice@example.com",
        role: "admin",
        registeredAt: "2024-01-01T00:00:00.000Z",
      },
      {
        _id: "2",
        name: "Bob",
        email: "bob@example.com",
        role: "super",
        registeredAt: "2024-01-02T00:00:00.000Z",
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ data: mockUsers }),
    } as Response);

    const { users, loading, error, fetchUsers } = useUserManagement();

    expect(loading.value).toBe(false);
    await fetchUsers();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/users`,
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );

    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(users.value).toEqual(mockUsers);
  });

  it("handles 401 error when fetching users", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: (): Promise<object> => Promise.resolve({ error: "Unauthorized" }),
    } as Response);

    const { users, error, fetchUsers } = useUserManagement();

    await fetchUsers();

    expect(error.value).toBe("Access denied - please login");
    expect(users.value).toEqual([]);
  });

  it("handles 403 error when fetching users", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: (): Promise<object> => Promise.resolve({ error: "Forbidden" }),
    } as Response);

    const { error, fetchUsers } = useUserManagement();

    await fetchUsers();

    expect(error.value).toBe("Forbidden: Higher admin privileges required");
  });

  it("handles generic error when fetching users", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: (): Promise<object> => Promise.resolve({ error: "Server error" }),
    } as Response);

    const { error, fetchUsers } = useUserManagement();

    await fetchUsers();

    expect(error.value).toBe("Failed to fetch users");
  });

  it("handles network error when fetching users", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const { users, error, fetchUsers } = useUserManagement();

    await fetchUsers();

    expect(error.value).toBe("Network error");
    expect(users.value).toEqual([]);
  });

  it("updates password successfully", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> =>
        Promise.resolve({ error: null, message: "Password updated" }),
    } as Response);

    const { updatePassword } = useUserManagement();

    const result = await updatePassword("userId123", "newPassword456");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/user/userId123/password`,
      expect.objectContaining({
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ newPassword: "newPassword456" }),
      })
    );

    expect(result).toBe(true);
  });

  it("handles error when updating password", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: (): Promise<object> =>
        Promise.resolve({ error: "Invalid password" }),
    } as Response);

    const { error, updatePassword } = useUserManagement();

    const result = await updatePassword("userId123", "weak");

    expect(result).toBe(false);
    expect(error.value).toBe("Invalid password");
  });

  it("updates current user password", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ error: null }),
    } as Response);

    const { updateCurrentUserPassword } = useUserManagement();

    const result = await updateCurrentUserPassword(
      "currentPassword",
      "newPassword"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/user/update-password`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "currentPassword",
          newPassword: "newPassword",
        }),
      })
    );

    expect(result).toBe(true);
  });

  it("creates user successfully and refreshes list", async (): Promise<void> => {
    const mockUsers: User[] = [
      {
        _id: "newUser",
        name: "New User",
        email: "new@example.com",
        role: "admin",
        registeredAt: "2024-03-01T00:00:00.000Z",
      },
    ];

    // Mock create user response

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> =>
          Promise.resolve({ data: { _id: "newUser" } }),
      } as Response)
      // Mock fetchUsers response
      .mockResolvedValueOnce({
        ok: true,
        json: (): Promise<object> => Promise.resolve({ data: mockUsers }),
      } as Response);

    const { users, createUser } = useUserManagement();

    const result = await createUser(
      "New User",
      "new@example.com",
      "password123",
      "admin"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/user/register`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name: "New User",
          email: "new@example.com",
          password: "password123",
          role: "admin",
        }),
      })
    );

    expect(result).toBe(true);
    expect(users.value).toEqual(mockUsers);
  });

  it("handles error when creating user", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: (): Promise<object> =>
        Promise.resolve({ error: "Email already exists" }),
    } as Response);

    const { error, createUser } = useUserManagement();

    const result = await createUser(
      "Test",
      "existing@example.com",
      "pass",
      "admin"
    );

    expect(result).toBe(false);
    expect(error.value).toBe("Email already exists");
  });

  it("deletes user successfully and updates local state", async (): Promise<void> => {
    const mockUsers: User[] = [
      {
        _id: "1",
        name: "User 1",
        email: "user1@example.com",
        role: "admin",
        registeredAt: "2024-01-01T00:00:00.000Z",
      },
      {
        _id: "2",
        name: "User 2",
        email: "user2@example.com",
        role: "admin",
        registeredAt: "2024-01-02T00:00:00.000Z",
      },
    ];

    // First fetch users

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ data: mockUsers }),
    } as Response);

    const { users, fetchUsers, deleteUser } = useUserManagement();
    await fetchUsers();

    expect(users.value.length).toBe(2);

    // Then delete one

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ error: null }),
    } as Response);

    const result = await deleteUser("1");

    expect(global.fetch).toHaveBeenLastCalledWith(
      `${API}/user/1`,
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      })
    );

    expect(result).toBe(true);
    expect(users.value.length).toBe(1);
    expect(users.value[0]._id).toBe("2");
  });

  it("handles error when deleting user", async (): Promise<void> => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: (): Promise<object> =>
        Promise.resolve({ error: "Cannot delete super user" }),
    } as Response);

    const { error, deleteUser } = useUserManagement();

    const result = await deleteUser("superUserId");

    expect(result).toBe(false);
    expect(error.value).toBe("Cannot delete super user");
  });

  it("sets loading state correctly during operations", async (): Promise<void> => {
    let resolvePromise: ((value: unknown) => void) | undefined;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(global, "fetch").mockReturnValueOnce(promise as Promise<Response>);

    const { loading, fetchUsers } = useUserManagement();

    expect(loading.value).toBe(false);

    const fetchPromise = fetchUsers();
    expect(loading.value).toBe(true);

    // resolvePromise is guaranteed to be assigned by Promise constructor
    expect(resolvePromise).toBeDefined();
    resolvePromise?.({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ data: [] }),
    } as object);

    await fetchPromise;
    expect(loading.value).toBe(false);
  });

  it("clears error state on successful operation", async (): Promise<void> => {
    // First request fails

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: (): Promise<object> => Promise.resolve({ error: "Error" }),
    } as Response);

    const { error, fetchUsers } = useUserManagement();

    await fetchUsers();
    expect(error.value).toBe("Failed to fetch users");

    // Second request succeeds

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: (): Promise<object> => Promise.resolve({ data: [] }),
    } as Response);

    await fetchUsers();
    expect(error.value).toBeNull();
  });
});
