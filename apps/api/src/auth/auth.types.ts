export type PublicUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: PublicUser | null;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};
