export type AuthResponse = {
  data: { userId: string };
};

export type RegisterResponse = {
  data: { _id: string };
};

export type ErrorResponse = {
  error?: string;
};

export type AuthCheckResponse = {
  isAuthenticated?: boolean;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "super" | "admin";
  };
};
