import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  User,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { userService } from '../services/dbServices';
import { UserProfile, AppLanguage, AttemptType } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string, targetAttempt: AttemptType, preferredLanguage: AppLanguage) => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileSettings: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const profile = await userService.getUserProfile(auth.currentUser.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        let profile = await userService.getUserProfile(user.uid);
        if (!profile) {
          // New user creation (e.g. first Google Sign-In)
          const isBootstrapAdmin = user.email === 'abhikgamingworldabhikpro3@gmail.com';
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || "Aspirant",
            email: user.email || "",
            role: isBootstrapAdmin ? 'admin' : 'student',
            targetExam: 'NDA',
            targetAttempt: 'Both',
            preferredLanguage: 'en',
            dailyTarget: 10,
            streak: 0,
            onboardingCompleted: false,
            createdAt: new Date().toISOString()
          };
          await userService.createUserProfile(newProfile);
          profile = newProfile;
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth error:", err);
      setLoading(false);
      throw err;
    }
  };

  const signUpEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    targetAttempt: AttemptType, 
    preferredLanguage: AppLanguage
  ) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const isBootstrapAdmin = email === 'abhikgamingworldabhikpro3@gmail.com';
      const profile: UserProfile = {
        uid: credential.user.uid,
        name,
        email,
        role: isBootstrapAdmin ? 'admin' : 'student',
        targetExam: 'NDA',
        targetAttempt,
        preferredLanguage,
        dailyTarget: 10,
        streak: 0,
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };
      await userService.createUserProfile(profile);
      setUserProfile(profile);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw err;
    }
  };

  const updateProfileSettings = async (data: Partial<UserProfile>) => {
    if (currentUser) {
      await userService.updateUserProfile(currentUser.uid, data);
      await refreshProfile();
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      signInWithGoogle,
      signUpEmail,
      loginEmail,
      logOut,
      resetPassword,
      refreshProfile,
      updateProfileSettings
    }}>
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
