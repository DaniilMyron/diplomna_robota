import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/auth';
import type { AuthMode } from './auth-page.types';

export function useAuthPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  return {
    mode,
    email,
    username,
    displayName,
    password,
    setEmail,
    setUsername,
    setDisplayName,
    setPassword,
    switchToRegister: () => setMode('register'),
    switchToLogin: () => setMode('login'),
    submit: async () => {
      if (mode === 'register') {
        await auth.register({ email, username, displayName, password });
      } else {
        await auth.login({ email, password });
      }

      navigate('/');
    },
  };
}
