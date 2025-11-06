import { computed, ref } from "vue";

import type { User } from "../../interfaces/userInterfaces";
import type {
  AuthResponse,
  ErrorResponse,
  RegisterResponse,
} from "../../interfaces/authInterfaces";
import { state } from "../global/state";
import router from "../../router";

export const useUsers = (): {
  token: ReturnType<typeof ref<string | null>>;
  isLoggedIn: { readonly value: boolean };
  error: ReturnType<typeof ref<string | null>>;
  user: ReturnType<typeof ref<User | null>>;
  name: ReturnType<typeof ref<string>>;
  email: ReturnType<typeof ref<string>>;
  password: ReturnType<typeof ref<string>>;
  fetchToken: (email: string, password: string) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
} => {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const token = ref<string | null>(null);
  const error = ref<string | null>(null);
  const user = ref<User | null>(null);
  const name = ref<string>("");
  const email = ref<string>("");
  const password = ref<string>("");

  //login
  const fetchToken = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(API_URL + "/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("lsToken") ?? "",
        },
        body: JSON.stringify({ email, password }),
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
      token.value = authResponse.data.token;
      user.value = authResponse.data.user;
      state.isLoggedIn = true;

      localStorage.setItem("lsToken", authResponse.data.token);
      localStorage.setItem("userIDToken", authResponse.data.userId);
      console.log("user is logged in: ", authResponse);
      console.log("token: ", token.value);
      await router.push("/");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      state.isLoggedIn = false;
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
      });

      const responseData = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error("No data available");
      }

      token.value = responseData.data.token;
      user.value = responseData.data.user;

      localStorage.setItem("lsToken", responseData.data.token);
      console.log("user is registered: ", responseData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    }
  };

  const logout = async (): Promise<void> => {
    token.value = null;
    user.value = null;
    state.isLoggedIn = false;
    localStorage.removeItem("lsToken");
    console.warn("user is logged out");
    await router.push("/login");
  };

  return {
    token,
    isLoggedIn: computed(() => state.isLoggedIn),
    error,
    user,
    name,
    email,
    password,
    fetchToken,
    registerUser,
    logout,
  };
};
