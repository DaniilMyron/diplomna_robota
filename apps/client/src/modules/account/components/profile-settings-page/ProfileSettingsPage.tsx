import { ChangeEvent, FormEvent, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { HttpError } from '@/modules/shared/http/http-client';
import { updateCurrentUser } from '../../api/account-api';
import styles from './ProfileSettingsPage.module.css';

export function ProfileSettingsPage() {
  const { token, user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [avatarError, setAvatarError] = useState('');
  const [saveError, setSaveError] = useState('');

  if (!user || !token) {
    return null;
  }

  const authToken = token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName.length < 2) {
      setStatus('error');
      return;
    }

    setSaveError('');
    setStatus('saving');

    try {
      const updatedUser = await updateCurrentUser(authToken, { displayName: trimmedDisplayName, avatarUrl });
      updateUser(updatedUser);
      setDisplayName(updatedUser.displayName);
      setAvatarUrl(updatedUser.avatarUrl);
      setAvatarFailed(false);
      setStatus('saved');
    } catch (error) {
      if (error instanceof HttpError && error.code === 'NETWORK_ERROR') {
        setSaveError('Server is not reachable. Start the backend and try again.');
      } else {
        setSaveError('Could not save profile');
      }
      setStatus('error');
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus('idle');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file');
      return;
    }

    if (file.size > 5_000_000) {
      setAvatarError('Image must be smaller than 5 MB');
      return;
    }

    try {
      const resizedAvatarUrl = await resizeAvatar(file);
      setAvatarUrl(resizedAvatarUrl);
      setAvatarFailed(false);
      setAvatarError('');
    } catch {
      setAvatarError('Could not load image');
    }
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
          {status === 'error' ? <span className={styles.error}>{saveError || 'Could not save profile'}</span> : null}
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

async function resizeAvatar(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    throw new Error('Image has no dimensions');
  }

  const canvas = document.createElement('canvas');
  const maxSize = 256;
  const scale = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight, 1);
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not supported');
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = source;
  });
}
