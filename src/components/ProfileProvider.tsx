'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { Profile } from '@/lib/profile';

const ProfileContext = createContext<Profile | null>(null);

/** Hands the locale's profile (resolved on the server) to client components. */
export function ProfileProvider({ profile, children }: { profile: Profile; children: ReactNode }) {
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Profile {
  const profile = useContext(ProfileContext);
  if (!profile) throw new Error('useProfile must be used inside <ProfileProvider>');
  return profile;
}
