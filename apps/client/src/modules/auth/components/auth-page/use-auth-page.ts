import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { HttpError } from '@/modules/shared/http/http-client';
import { useAuth } from '../../providers/auth';
import type { AuthMode } from './auth-page.types';

type FieldName = 'email' | 'username' | 'displayName' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

const registerSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  username: z.string().trim()
    .min(3, 'Username must be at least 3 characters')
    .max(64, 'Username must be 64 characters or fewer')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can use letters, numbers, dots, underscores, and dashes'),
  displayName: z.string().trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(80, 'Display name must be 80 characters or fewer'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
});

const loginSchema = registerSchema.pick({
  email: true,
  password: true,
});

export function useAuthPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const switchMode = (nextMode: AuthMode) => {
    clearErrors();
    setMode(nextMode);
  };

  const updateField = (field: FieldName, value: string) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);

    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'displayName':
        setDisplayName(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }
  };

  return {
    mode,
    email,
    username,
    displayName,
    password,
    fieldErrors,
    formError,
    isSubmitting,
    setEmail: (value: string) => updateField('email', value),
    setUsername: (value: string) => updateField('username', value),
    setDisplayName: (value: string) => updateField('displayName', value),
    setPassword: (value: string) => updateField('password', value),
    switchToRegister: () => switchMode('register'),
    switchToLogin: () => switchMode('login'),
    submit: async () => {
      clearErrors();

      setIsSubmitting(true);
      try {
        if (mode === 'register') {
          const validation = registerSchema.safeParse({ email, username, displayName, password });
          if (!validation.success) {
            setFieldErrors(toFieldErrors(validation.error.issues));
            return;
          }
          await auth.register(validation.data);
        } else {
          const validation = loginSchema.safeParse({ email, password });
          if (!validation.success) {
            setFieldErrors(toFieldErrors(validation.error.issues));
            return;
          }
          await auth.login(validation.data);
        }

        navigate('/');
      } catch (error) {
        if (mode === 'register' && error instanceof HttpError && error.code === 'AUTH_USER_ALREADY_EXISTS') {
          setFieldErrors({ username: 'Username is already taken' });
          return;
        }
        if (error instanceof HttpError && error.code === 'NETWORK_ERROR') {
          setFormError('Server is not reachable. Start the backend and try again.');
          return;
        }
        setFormError(mode === 'register'
          ? 'Registration failed. Check your details and try again.'
          : 'Login failed. Check your email and password.');
      } finally {
        setIsSubmitting(false);
      }
    },
  };
}

function toFieldErrors(issues: z.ZodIssue[]): FieldErrors {
  const nextErrors: FieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in nextErrors)) {
      nextErrors[field as FieldName] = issue.message;
    }
  }
  return nextErrors;
}
