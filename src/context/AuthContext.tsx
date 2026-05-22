import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserProfile, type CurrentUserProfile } from '../lib/apis/auth/getCurrentUserProfile';
import { account } from '../lib/appwrite';

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

  const fetchProfile = async () => {
    try {
      const p = await getCurrentUserProfile();
      setProfile(p);
      return p;
    } catch (err) {
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = async () => {
    try {
      await account.deleteSession('current');
    } finally {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    return await fetchProfile();
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
