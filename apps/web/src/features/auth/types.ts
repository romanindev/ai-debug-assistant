export type PublicUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: PublicUser | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
