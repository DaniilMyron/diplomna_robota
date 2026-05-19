import { useEffect, useState } from 'react';
import styles from './SettingsPageContent.module.css';

const THEME_STORAGE_KEY = 'team-task-manager-theme';

export function SettingsPageContent() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) === 'dark');

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [darkMode]);

  return (
    <section className={styles.page}>
      <header>
        <h1 className={styles.heading}>Settings</h1>
      </header>
      <div className={styles.panel}>
        <section className={styles.group}>
          <h2 className={styles.groupHeading}>Theme</h2>
          <label className={styles.settingRow}>
            <span>Dark Mode</span>
            <input
              className={styles.switchInput}
              type="checkbox"
              checked={darkMode}
              onChange={(event) => setDarkMode(event.target.checked)}
            />
          </label>
        </section>
        <section className={styles.group}>
          <h2 className={styles.groupHeading}>Maybe Setting in the future</h2>
        </section>
      </div>
    </section>
  );
}
