import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { AuthProvider } from '../providers/auth';
import { AuthPage } from '../pages/AuthPage';

test('a visitor can register and reach an authenticated shell state', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          username: 'dmyrosh',
          displayName: 'Dmytro',
          avatarUrl: '/avatar.png',
        },
      }),
    }),
  );

  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'dmyrosh' } });
  fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Dmytro' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Register' }));

  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' })));
});
