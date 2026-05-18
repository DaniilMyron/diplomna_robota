import type { FormEvent } from 'react';
import type { AuthMode } from './auth-page.types';

type Props = {
  mode: AuthMode;
  email: string;
  username: string;
  displayName: string;
  password: string;
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
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input aria-label="Email" value={props.email} onChange={(event) => props.onEmailChange(event.target.value)} />
      </label>
      {props.mode === 'register' ? (
        <>
          <label>
            Username
            <input aria-label="Username" value={props.username} onChange={(event) => props.onUsernameChange(event.target.value)} />
          </label>
          <label>
            Display Name
            <input aria-label="Display Name" value={props.displayName} onChange={(event) => props.onDisplayNameChange(event.target.value)} />
          </label>
        </>
      ) : null}
      <label>
        Password
        <input aria-label="Password" type="password" value={props.password} onChange={(event) => props.onPasswordChange(event.target.value)} />
      </label>
      <button type="submit">{props.mode === 'register' ? 'Register' : 'Log in'}</button>
    </form>
  );
}
