export type User = {
  _id: string;
  name: string;
  email: string;
  role: "super" | "admin";
  registeredAt: string;
};
