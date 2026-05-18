import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage, AuthProvider, RequireAuth } from '@/modules/auth';
import { AppShell } from '@/modules/shared/layout/app-shell/AppShell';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
