import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from '../providers/auth';
import { RequireAuth } from '../RequireAuth';
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

test('registration highlights invalid fields before sending a request', async () => {
  vi.stubGlobal('fetch', vi.fn());

  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
  fireEvent.click(screen.getByRole('button', { name: 'Register' }));

  expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Username is required')).toBeInTheDocument();
  expect(screen.getByText('Display name is required')).toBeInTheDocument();
  expect(screen.getByText('Password is required')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

test('registration shows a form error when the server rejects the request', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
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

  expect(await screen.findByRole('alert')).toHaveTextContent('Registration failed. Check your details and try again.');
});

test('a returning user stays authenticated after a page reload', async () => {
  localStorage.setItem(
    'team-task-manager-auth',
    JSON.stringify({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        username: 'dmyrosh',
        displayName: 'Dmytro',
        avatarUrl: '/avatar.png',
      },
    }),
  );

  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <AuthenticatedState />
              </RequireAuth>
            }
          />
          <Route path="/auth" element={<p>Auth page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

  expect(screen.getByText('Dmytro')).toBeInTheDocument();
});

function AuthenticatedState() {
  const { user } = useAuth();

  return <p>{user?.displayName}</p>;
}
