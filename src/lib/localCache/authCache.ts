import type { CurrentUserProfile } from '../apis/auth/getCurrentUserProfile';

const AUTH_CACHE_KEY = 'kora.auth.profile';

export const readCachedProfile = (): CurrentUserProfile | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUserProfile;
  } catch (error) {
    console.error('Failed to read cached profile:', error);
    return null;
  }
};

export const writeCachedProfile = (profile: CurrentUserProfile | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (!profile) {
      window.localStorage.removeItem(AUTH_CACHE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to write cached profile:', error);
  }
};

export const clearCachedProfile = () => writeCachedProfile(null);
