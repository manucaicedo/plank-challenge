'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  userRole: 'admin' | 'participant' | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'participant' | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up new user
  async function signup(email: string, password: string, name: string) {
    let userCreated = false;
    let userCredential;

    try {
      console.log('AuthContext: Starting signup for:', email);

      // Check if Firebase is initialized
      if (!auth || typeof auth.createUser === 'undefined') {
        console.error('AuthContext: Firebase auth not properly initialized');
        throw new Error('Authentication service not available');
      }

      // Check if Firestore is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('AuthContext: Firestore not properly initialized');
        throw new Error('Database service not available');
      }

      console.log('AuthContext: Creating user with Firebase Auth...');
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      userCreated = true;
      console.log('AuthContext: User created in Firebase Auth:', user.uid);

      // Update display name
      console.log('AuthContext: Updating display name...');
      await updateProfile(user, { displayName: name });
      console.log('AuthContext: Display name updated');

      // Create user document in Firestore with timeout
      console.log('AuthContext: Creating Firestore user document...');
      await Promise.race([
        setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          role: 'participant', // Default role
          createdAt: new Date().toISOString(),
          avatar: null,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore write timeout after 5 seconds')), 5000)
        )
      ]);
      console.log('AuthContext: Firestore user document created');
      console.log('AuthContext: Signup complete!');
    } catch (error) {
      console.error('AuthContext: Signup error:', error);

      // If we created the Auth user but failed to create Firestore doc, clean up
      if (userCreated && userCredential) {
        console.log('AuthContext: Cleaning up orphaned Auth account...');
        try {
          await userCredential.user.delete();
          console.log('AuthContext: Orphaned Auth account deleted');
        } catch (deleteError) {
          console.error('AuthContext: Failed to delete orphaned account:', deleteError);
        }
      }

      throw error;
    }
  }

  // Login existing user
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  // Logout user
  async function logout() {
    await signOut(auth);
  }

  // Send password reset email
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Fetch user role from Firestore
  async function fetchUserRole(uid: string, email: string | null) {
    try {
      // Hardcoded admin emails (override database role)
      const ADMIN_EMAILS = ['manuela.i.caicedo@gmail.com'];

      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        setUserRole('admin');

        // Also update the database to reflect admin role
        try {
          await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
        } catch (error) {
          console.error('Error updating admin role in database:', error);
        }
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || 'participant');
      } else {
        setUserRole('participant');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('participant');
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Set a timeout to stop loading after 2 seconds even if auth doesn't respond
    const timeout = setTimeout(() => {
      console.log('Auth timeout - stopping loading state');
      setLoading(false);
    }, 2000);

    // Check if auth is properly initialized
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      console.warn('Firebase auth not initialized');
      clearTimeout(timeout);
      setLoading(false);
      return;
    }

    try {
      console.log('AuthContext: Setting up auth state listener');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('AuthContext: Auth state changed, user:', user ? user.email : 'null');
        clearTimeout(timeout);
        setUser(user);
        if (user) {
          console.log('AuthContext: Fetching role for user:', user.uid);
          await fetchUserRole(user.uid, user.email);
        } else {
          setUserRole(null);
        }
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      });

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    userRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
