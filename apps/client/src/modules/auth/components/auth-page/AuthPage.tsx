import { AuthPageForm } from './AuthPageForm';
import { useAuthPage } from './use-auth-page';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const model = useAuthPage();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.heading}>{model.mode === 'register' ? 'Create account' : 'Welcome back'}</h1>
        <AuthPageForm
          mode={model.mode}
          email={model.email}
          username={model.username}
          displayName={model.displayName}
          password={model.password}
          fieldErrors={model.fieldErrors}
          formError={model.formError}
          isSubmitting={model.isSubmitting}
          onEmailChange={model.setEmail}
          onUsernameChange={model.setUsername}
          onDisplayNameChange={model.setDisplayName}
          onPasswordChange={model.setPassword}
          onSubmit={model.submit}
        />
        <button className={styles.secondaryButton} onClick={model.mode === 'register' ? model.switchToLogin : model.switchToRegister}>
          {model.mode === 'register' ? 'Already have an account?' : 'Need an account?'}
        </button>
      </section>
    </main>
  );
}
