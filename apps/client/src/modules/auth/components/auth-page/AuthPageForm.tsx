import type { FormEvent } from 'react';
import type { AuthMode } from './auth-page.types';
import styles from './AuthPage.module.css';

type Props = {
  mode: AuthMode;
  email: string;
  username: string;
  displayName: string;
  password: string;
  fieldErrors: Partial<Record<'email' | 'username' | 'displayName' | 'password', string>>;
  formError: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export function AuthPageForm(props: Props) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void props.onSubmit();
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        Email
        <input
          className={`${styles.input} ${props.fieldErrors.email ? styles.inputError : ''}`}
          aria-label="Email"
          aria-invalid={Boolean(props.fieldErrors.email)}
          value={props.email}
          onChange={(event) => props.onEmailChange(event.target.value)}
        />
        {props.fieldErrors.email ? <span className={styles.fieldError}>{props.fieldErrors.email}</span> : null}
      </label>
      {props.mode === 'register' ? (
        <>
          <label className={styles.field}>
            Username
            <input
              className={`${styles.input} ${props.fieldErrors.username ? styles.inputError : ''}`}
              aria-label="Username"
              aria-invalid={Boolean(props.fieldErrors.username)}
              value={props.username}
              onChange={(event) => props.onUsernameChange(event.target.value)}
            />
            {props.fieldErrors.username ? <span className={styles.fieldError}>{props.fieldErrors.username}</span> : null}
          </label>
          <label className={styles.field}>
            Display Name
            <input
              className={`${styles.input} ${props.fieldErrors.displayName ? styles.inputError : ''}`}
              aria-label="Display Name"
              aria-invalid={Boolean(props.fieldErrors.displayName)}
              value={props.displayName}
              onChange={(event) => props.onDisplayNameChange(event.target.value)}
            />
            {props.fieldErrors.displayName ? <span className={styles.fieldError}>{props.fieldErrors.displayName}</span> : null}
          </label>
        </>
      ) : null}
      <label className={styles.field}>
        Password
        <input
          className={`${styles.input} ${props.fieldErrors.password ? styles.inputError : ''}`}
          aria-label="Password"
          aria-invalid={Boolean(props.fieldErrors.password)}
          type="password"
          value={props.password}
          onChange={(event) => props.onPasswordChange(event.target.value)}
        />
        {props.fieldErrors.password ? <span className={styles.fieldError}>{props.fieldErrors.password}</span> : null}
      </label>
      {props.formError ? <p className={styles.formError} role="alert">{props.formError}</p> : null}
      <button className={styles.primaryButton} type="submit" disabled={props.isSubmitting}>
        {props.mode === 'register' ? 'Register' : 'Log in'}
      </button>
    </form>
  );
}
