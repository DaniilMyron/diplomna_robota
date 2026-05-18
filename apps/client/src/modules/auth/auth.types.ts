export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type RegisterInput = {
  email: string;
  username: string;
  displayName: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
