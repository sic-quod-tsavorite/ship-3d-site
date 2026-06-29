// Imports
import { ref } from "vue";
import type { Ref } from "vue";

import type {
  AuthResponse,
  ErrorResponse,
  RegisterResponse,
} from "@/interfaces/authInterfaces";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

export const useUsers = (): {
  error: Ref<string | null>;
  loading: Ref<boolean>;
  name: Ref<string>;
  email: Ref<string>;
  password: Ref<string>;
  fetchToken: (email: string, password: string) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
} => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const name = ref<string>("");
  const email = ref<string>("");
  const password = ref<string>("");
  const auth = useAuthStore();

  //login
  const fetchToken = async (email: string, password: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(API_URL + "/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const responseData = (await response.json()) as
        AuthResponse | ErrorResponse;

      if (!response.ok) {
        // Handle different HTTP status codes with error messages
        if (response.status === 401 || response.status === 403) {
          throw new Error("Wrong email or password");
        } else if (response.status === 429) {
          throw new Error("Too many login attempts, please try again later");
        } else if (response.status >= 500) {
          throw new Error("Server error, please try again later");
        } else {
          throw new Error("Wrong email or password");
        }
      }

      const authResponse = responseData as AuthResponse;

      await auth.initAuth();

      console.log("user is logged in: ", authResponse);
      await router.push("/");
    } catch (err) {
      if (err instanceof TypeError) {
        // Network error (fetch failed)
        error.value = "Connection error, please try again";
      } else {
        error.value = err instanceof Error ? err.message : "An error occurred";
      }
      await auth.logout();
    } finally {
      loading.value = false;
    }
  };

  //register
  const registerUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await fetch(API_URL + "/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const responseData = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error("No data available");
      }

      await auth.initAuth();

      console.log("user is registered: ", responseData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    }
  };

  return {
    error,
    loading,
    name,
    email,
    password,
    fetchToken,
    registerUser,
  };
};
