// Imports
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Project imports
import router from "@/router";
import type { AuthCheckResponse } from "@/interfaces/authInterfaces";

export const useAuthStore = defineStore("auth", () => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const _isLoggedIn = ref<boolean>(false);
  const userId = ref<string | null>(null);
  const userName = ref<string | null>(null);
  const userEmail = ref<string | null>(null);
  const userRole = ref<"super" | "admin" | null>(null);

  const isLoggedIn = computed(() => _isLoggedIn.value);

  const isAuthCheckResponse = (obj: unknown): obj is AuthCheckResponse =>
    typeof obj === "object" && obj !== null && "isAuthenticated" in obj;

  async function initAuth(): Promise<void> {
    try {
      const response = await fetch(API_URL + "/user/check-auth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const raw = (await response.json()) as unknown;

      if (response.ok && isAuthCheckResponse(raw) && raw.isAuthenticated) {
        _isLoggedIn.value = true;
        userId.value = raw.user?.id ?? null;
        userName.value = raw.user?.name ?? null;
        userEmail.value = raw.user?.email ?? null;
        userRole.value = raw.user?.role ?? null;
      } else {
        _isLoggedIn.value = false;
        userId.value = null;
        userName.value = null;
        userEmail.value = null;
        userRole.value = null;
      }
    } catch (error) {
      console.error("Error initializing authentication:", error);
      _isLoggedIn.value = false;
      userId.value = null;
      userName.value = null;
      userEmail.value = null;
      userRole.value = null;
    }
  }

  async function login(
    newUserId: string,
    newUserName: string,
    newUserEmail: string
  ): Promise<void> {
    _isLoggedIn.value = true;
    userId.value = newUserId;
    userName.value = newUserName;
    userEmail.value = newUserEmail;

    await initAuth();
  }

  async function logout(): Promise<void> {
    try {
      await fetch(API_URL + "/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      _isLoggedIn.value = false;
      userId.value = null;
      userName.value = null;
      userEmail.value = null;
      userRole.value = null;
      await router.push("/login");
    }
  }

  return {
    isLoggedIn,
    userId,
    userName,
    userEmail,
    userRole,
    login,
    logout,
    initAuth,
  };
});
