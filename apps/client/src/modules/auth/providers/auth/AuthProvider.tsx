import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../../api/auth-api';
import type { LoginInput, RegisterInput, User } from '../../auth.types';
import { AuthContext } from './auth.context';

const STORAGE_KEY = 'team-task-manager-auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(readStoredSession()));
  const [shouldValidateSession, setShouldValidateSession] = useState(() => Boolean(readStoredSession()));
  const user = session?.user ?? null;
  const token = session?.token ?? null;

  useEffect(() => {
    if (!token || !shouldValidateSession) {
      setIsCheckingSession(false);
      return;
    }

    let isCurrent = true;
    setIsCheckingSession(true);

    void getCurrentUser(token)
      .then((currentUser) => {
        if (!isCurrent) {
          return;
        }

        const refreshedSession = { token, user: currentUser };
        storeSession(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => {
        if (isCurrent) {
          setShouldValidateSession(false);
          setIsCheckingSession(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [shouldValidateSession, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isCheckingSession,
      register: async (input: RegisterInput) => {
        const response = await registerRequest(input);
        storeSession(response);
        setShouldValidateSession(false);
        setSession(response);
      },
      login: async (input: LoginInput) => {
        const response = await loginRequest(input);
        storeSession(response);
        setShouldValidateSession(false);
        setSession(response);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setShouldValidateSession(false);
        setSession(null);
      },
      updateUser: (updatedUser: User) => {
        if (!token) {
          return;
        }

        const updatedSession = { token, user: updatedUser };
        storeSession(updatedSession);
        setSession(updatedSession);
      },
    }),
    [isCheckingSession, token, user],
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
