import { useMemo, useState, type PropsWithChildren } from 'react';
import { login as loginRequest, register as registerRequest } from '../../api/auth-api';
import type { LoginInput, RegisterInput, User } from '../../auth.types';
import { AuthContext } from './auth.context';

const STORAGE_KEY = 'team-task-manager-auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(() => readStoredSession());
  const user = session?.user ?? null;
  const token = session?.token ?? null;

  const value = useMemo(
    () => ({
      user,
      token,
      register: async (input: RegisterInput) => {
        const response = await registerRequest(input);
        storeSession(response);
        setSession(response);
      },
      login: async (input: LoginInput) => {
        const response = await loginRequest(input);
        storeSession(response);
        setSession(response);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type StoredSession = {
  token: string;
  user: User;
};

function readStoredSession(): StoredSession | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as StoredSession;
    if (parsed.token && parsed.user) {
      return parsed;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

function storeSession(session: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
