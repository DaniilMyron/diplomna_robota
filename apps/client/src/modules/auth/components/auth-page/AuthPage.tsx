import { AuthPageForm } from './AuthPageForm';
import { useAuthPage } from './use-auth-page';

export function AuthPage() {
  const model = useAuthPage();

  return (
    <main>
      <h1>{model.mode === 'register' ? 'Create account' : 'Welcome back'}</h1>
      <AuthPageForm
        mode={model.mode}
        email={model.email}
        username={model.username}
        displayName={model.displayName}
        password={model.password}
        onEmailChange={model.setEmail}
        onUsernameChange={model.setUsername}
        onDisplayNameChange={model.setDisplayName}
        onPasswordChange={model.setPassword}
        onSubmit={model.submit}
      />
      <button onClick={model.mode === 'register' ? model.switchToLogin : model.switchToRegister}>
        {model.mode === 'register' ? 'Already have an account?' : 'Need an account?'}
      </button>
    </main>
  );
}
