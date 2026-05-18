import { request } from '@/modules/shared/http/http-client';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../auth.types';

export function register(input: RegisterInput) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getCurrentUser(token: string) {
  return request<User>('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
