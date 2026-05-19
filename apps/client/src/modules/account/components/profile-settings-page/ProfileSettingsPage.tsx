import { ChangeEvent, FormEvent, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { updateCurrentUser } from '../../api/account-api';
import styles from './ProfileSettingsPage.module.css';

export function ProfileSettingsPage() {
  const { token, user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [avatarError, setAvatarError] = useState('');

  if (!user || !token) {
    return null;
  }

  const authToken = token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');

    try {
      const updatedUser = await updateCurrentUser(authToken, { displayName, avatarUrl });
      updateUser(updatedUser);
      setAvatarFailed(false);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file');
      return;
    }

    if (file.size > 1_000_000) {
      setAvatarError('Image must be smaller than 1 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result));
      setAvatarFailed(false);
      setAvatarError('');
    };
    reader.onerror = () => setAvatarError('Could not load image');
    reader.readAsDataURL(file);
  }

  return (
    <section className={styles.page}>
      <header>
        <h1 className={styles.heading}>Profile</h1>
        <p className={styles.subheading}>View your account and update the public details other team members see.</p>
      </header>
      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.preview}>
          {avatarFailed ? (
            <span className={styles.avatarFallback}>{getInitials(displayName)}</span>
          ) : (
            <img
              className={styles.avatar}
              src={avatarUrl}
              alt={displayName}
              width="86"
              height="86"
              onError={() => setAvatarFailed(true)}
              onLoad={() => setAvatarFailed(false)}
            />
          )}
          <div>
            <strong>{displayName}</strong>
            <span>@{user.username}</span>
          </div>
        </div>
        <label className={styles.field}>
          Username
          <input value={user.username} disabled />
        </label>
        <label className={styles.field}>
          Display name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label className={styles.field}>
          Avatar
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarError ? <span className={styles.error}>{avatarError}</span> : null}
        </label>
        <div className={styles.actions}>
          <button className={styles.button} disabled={status === 'saving'} type="submit">
            {status === 'saving' ? 'Saving...' : 'Save profile'}
          </button>
          {status === 'saved' ? <span className={styles.success}>Saved</span> : null}
          {status === 'error' ? <span className={styles.error}>Could not save profile</span> : null}
        </div>
      </form>
    </section>
  );
}

function getInitials(displayName: string) {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
