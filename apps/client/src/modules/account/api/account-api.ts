import { request } from '@/modules/shared/http/http-client';
import type { User } from '@/modules/auth/auth.types';
import type { UpdateProfileInput } from '../account.types';

export function updateCurrentUser(token: string, input: UpdateProfileInput) {
  return request<User>('/users/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
