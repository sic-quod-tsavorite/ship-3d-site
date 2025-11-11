export type AuthResponse = {
  data: { userId: string };
};

export type RegisterResponse = {
  data: { _id: string };
};

export type ErrorResponse = {
  error?: string;
};
