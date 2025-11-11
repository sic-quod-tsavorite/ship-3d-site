import { ref } from "vue";

import type {
  AuthResponse,
  ErrorResponse,
  RegisterResponse,
} from "@/interfaces/authInterfaces";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

export const useUsers = (): {
  error: ReturnType<typeof ref<string | null>>;
  name: ReturnType<typeof ref<string>>;
  email: ReturnType<typeof ref<string>>;
  password: ReturnType<typeof ref<string>>;
  fetchToken: (email: string, password: string) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
} => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const error = ref<string | null>(null);
  const name = ref<string>("");
  const email = ref<string>("");
  const password = ref<string>("");
  const auth = useAuthStore();

  //login
  const fetchToken = async (email: string, password: string): Promise<void> => {
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
        | AuthResponse
        | ErrorResponse;

      if (!response.ok) {
        const errorResponse = responseData as ErrorResponse;
        console.log(errorResponse.error ?? "Error");
        throw new Error("No data available");
      }

      const authResponse = responseData as AuthResponse;

      await auth.initAuth();

      console.log("user is logged in: ", authResponse);
      await router.push("/");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      await auth.logout();
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
    name,
    email,
    password,
    fetchToken,
    registerUser,
  };
};
