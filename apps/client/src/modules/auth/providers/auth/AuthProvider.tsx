import { useMemo, useState, type PropsWithChildren } from 'react';
import { login as loginRequest, register as registerRequest } from '../../api/auth-api';
import type { LoginInput, RegisterInput, User } from '../../auth.types';
import { AuthContext } from './auth.context';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      user,
      token,
      register: async (input: RegisterInput) => {
        const response = await registerRequest(input);
        setUser(response.user);
        setToken(response.token);
      },
      login: async (input: LoginInput) => {
        const response = await loginRequest(input);
        setUser(response.user);
        setToken(response.token);
      },
      logout: () => {
        setUser(null);
        setToken(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
