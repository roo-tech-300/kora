import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserProfile, type CurrentUserProfile } from '../lib/apis/auth/getCurrentUserProfile';
import { account } from '../lib/appwrite';
import { clearCachedProfile, readCachedProfile, writeCachedProfile } from '../lib/localCache/authCache';

type AuthContextType = {
  profile: CurrentUserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<CurrentUserProfile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (preferCache = true) => {
    if (preferCache) {
      const cached = readCachedProfile();
      if (cached) {
        setProfile(cached);
        setLoading(false);
      }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return readCachedProfile();
    }

    try {
      const p = await getCurrentUserProfile();
      setProfile(p);
      writeCachedProfile(p);
      return p;
    } catch (err) {
      const cached = readCachedProfile();
      setProfile(cached);
      return cached;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(true);

    const handleOnline = () => {
      fetchProfile(false);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const logout = async () => {
    try {
      await account.deleteSession('current');
    } finally {
      setProfile(null);
      clearCachedProfile();
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    return await fetchProfile(false);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
