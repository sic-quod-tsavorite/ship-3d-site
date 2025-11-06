import type { User } from "./userInterfaces";

export type AuthResponse = {
  data: { token: string; user: User; userId: string };
};

export type RegisterResponse = {
  data: { token: string; user: User };
};

export type ErrorResponse = {
  error?: string;
};
