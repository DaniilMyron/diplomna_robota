import type { LoginInput, RegisterInput, User } from '../../auth.types';

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isCheckingSession: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};
